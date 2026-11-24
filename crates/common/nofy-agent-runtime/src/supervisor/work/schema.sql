CREATE TABLE IF NOT EXISTS agent_runtime_work_owners(
    work_id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL,
    origin_run_id TEXT NOT NULL,
    command_id TEXT NOT NULL,
    request_digest TEXT NOT NULL,
    kind TEXT NOT NULL,
    UNIQUE(session_id,command_id)
);
CREATE INDEX IF NOT EXISTS agent_runtime_work_owners_session
    ON agent_runtime_work_owners(session_id,work_id);
CREATE TABLE IF NOT EXISTS agent_runtime_work_commands(
    scope TEXT NOT NULL,
    command_id TEXT NOT NULL,
    digest TEXT NOT NULL,
    receipt TEXT NOT NULL,
    PRIMARY KEY(scope,command_id)
);
CREATE TABLE IF NOT EXISTS agent_runtime_work_changes(
    cursor INTEGER PRIMARY KEY AUTOINCREMENT,
    root_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    change_kind TEXT NOT NULL,
    native_status TEXT
);
CREATE INDEX IF NOT EXISTS agent_runtime_work_changes_root
    ON agent_runtime_work_changes(root_id,cursor);
CREATE INDEX IF NOT EXISTS agent_runtime_work_changes_node
    ON agent_runtime_work_changes(root_id,run_id,cursor);
CREATE INDEX IF NOT EXISTS agent_runtime_work_children_root
    ON agent_runtime_children(root_id,key);
CREATE INDEX IF NOT EXISTS idx_agent_runtime_children_run_id
    ON agent_runtime_children(json_extract(payload,'$.run_id'),root_id);
CREATE INDEX IF NOT EXISTS agent_runtime_work_approval_run
    ON agent_runtime_approvals(run_id,decision,key);
CREATE INDEX IF NOT EXISTS idx_agent_runtime_cancel_unack
    ON agent_runtime_cancel(acknowledged,json_extract(address,'$.run_id'),json_extract(address,'$.root_run_id'))
    WHERE acknowledged=0;

CREATE TRIGGER IF NOT EXISTS agent_runtime_work_queued AFTER INSERT ON agent_runtime_managed_runs
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.run_id,NEW.run_id,'run','queued');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_job_update AFTER UPDATE OF status ON agent_runtime_jobs
WHEN NEW.status IS NOT OLD.status AND (NEW.status IN ('cancelled','abandoned','initializing','running')
    OR NOT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=NEW.run_id))
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.run_id,NEW.run_id,'job',NEW.status);
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_run_insert AFTER INSERT ON agent_runtime_runs
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.id,NEW.id,'run',json_extract(NEW.payload,'$.status'));
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_run_update AFTER UPDATE OF payload ON agent_runtime_runs
WHEN json_extract(NEW.payload,'$.status') IS NOT json_extract(OLD.payload,'$.status')
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.id,NEW.id,'run',json_extract(NEW.payload,'$.status'));
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_child_insert AFTER INSERT ON agent_runtime_children
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.root_id,json_extract(NEW.payload,'$.run_id'),'child',json_extract(NEW.payload,'$.status'));
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_child_update AFTER UPDATE OF payload ON agent_runtime_children
WHEN json_extract(NEW.payload,'$.status') IS NOT json_extract(OLD.payload,'$.status')
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.root_id,json_extract(NEW.payload,'$.run_id'),'child',json_extract(NEW.payload,'$.status'));
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_approval_insert AFTER INSERT ON agent_runtime_approvals
WHEN NEW.decision IS NULL
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(coalesce((SELECT root_id FROM agent_runtime_children
        WHERE json_extract(payload,'$.run_id')=NEW.run_id LIMIT 1),NEW.run_id),NEW.run_id,'approval_requested');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_approval_decision AFTER UPDATE OF decision ON agent_runtime_approvals
WHEN NEW.decision IS NOT OLD.decision
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(coalesce((SELECT root_id FROM agent_runtime_children
        WHERE json_extract(payload,'$.run_id')=NEW.run_id LIMIT 1),NEW.run_id),NEW.run_id,'approval_decided');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_park_insert AFTER INSERT ON agent_runtime_parks
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.run_id,NEW.run_id,'park',NEW.status);
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_park_update AFTER UPDATE OF status ON agent_runtime_parks
WHEN NEW.status IS NOT OLD.status
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind,native_status)
    VALUES(NEW.run_id,NEW.run_id,'park',NEW.status);
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_cancel_insert AFTER INSERT ON agent_runtime_cancel
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(json_extract(NEW.address,'$.root_run_id'),json_extract(NEW.address,'$.run_id'),'cancel_requested');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_cancel_ack AFTER UPDATE OF acknowledged ON agent_runtime_cancel
WHEN NEW.acknowledged IS NOT OLD.acknowledged
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(json_extract(NEW.address,'$.root_run_id'),json_extract(NEW.address,'$.run_id'),'cancel_acknowledged');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_action_insert AFTER INSERT ON agent_runtime_managed_actions
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(NEW.run_id,coalesce(json_extract(NEW.payload,'$.command.target_run_id'),NEW.run_id),'command_accepted');
END;
CREATE TRIGGER IF NOT EXISTS agent_runtime_work_action_update AFTER UPDATE OF result ON agent_runtime_managed_actions
WHEN NEW.result IS NOT NULL AND OLD.result IS NULL
BEGIN
    INSERT INTO agent_runtime_work_changes(root_id,run_id,change_kind)
    VALUES(NEW.run_id,coalesce(json_extract(NEW.payload,'$.command.target_run_id'),NEW.run_id),'command_finished');
END;
