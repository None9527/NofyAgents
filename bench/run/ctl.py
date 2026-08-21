#!/usr/bin/env python3
"""Control-plane client for the nofy daemon (benchmark harness).

Speaks the nofy-channel wire format: [u32 BE length][JSON payload],
Hello handshake first, then one ControlMethod frame per call with one
response frame. Mirrors nofy-daemon control_client semantics.

Usage:
  ctl.py <sock> ping
  ctl.py <sock> session_list [limit]
  ctl.py <sock> session_search <query>
  ctl.py <sock> task_submit <manifest.toml>
  ctl.py <sock> task_poll
  ctl.py <sock> task_result <task_id> <true|false>
  ctl.py <sock> schedule_enable | schedule_add <id> <cron> | schedule_remove <id> | schedule_list
  ctl.py <sock> approval_respond <intent_id> <allow_once|allow_session|deny>
Prints the response JSON on stdout; exit 0 on any well-formed response
(including control errors), exit 2 on transport failure.
"""
import json
import socket
import struct
import sys


def send_frame(sock, obj):
    data = json.dumps(obj).encode()
    sock.sendall(struct.pack(">I", len(data)) + data)


def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("peer closed")
        buf += chunk
    return buf


def recv_frame(sock):
    (length,) = struct.unpack(">I", recv_exact(sock, 4))
    if length > 16 * 1024 * 1024:
        raise ValueError(f"frame too large: {length}")
    return json.loads(recv_exact(sock, length))


def connect(sock_path):
    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.settimeout(120)
    s.connect(sock_path)
    send_frame(s, {"version": {"major": 1, "minor": 0},
                   "client_id": "bench-ctl", "caps": []})
    ack = recv_frame(s)
    if ack.get("kind") not in ("accepted", "Accepted"):
        raise ConnectionError(f"hello rejected: {ack}")
    return s


def call(sock_path, method):
    s = connect(sock_path)
    try:
        send_frame(s, method)
        return recv_frame(s)
    finally:
        s.close()


def main():
    sock_path, cmd, rest = sys.argv[1], sys.argv[2], sys.argv[3:]
    if cmd == "ping":
        resp = call(sock_path, {"method": "ping"})
    elif cmd == "session_list":
        m = {"method": "session_list"}
        if rest:
            m["limit"] = int(rest[0])
        resp = call(sock_path, m)
    elif cmd == "session_search":
        resp = call(sock_path, {"method": "session_search", "query": rest[0]})
    elif cmd == "task_submit":
        manifest = open(rest[0]).read()
        resp = call(sock_path, {"method": "task_submit",
                                "manifest": manifest, "packs": []})
    elif cmd == "task_poll":
        resp = call(sock_path, {"method": "task_poll"})
    elif cmd == "task_result":
        resp = call(sock_path, {"method": "task_result", "task_id": rest[0],
                                "succeeded": rest[1] == "true"})
    elif cmd == "schedule_enable":
        resp = call(sock_path, {"method": "schedule_enable"})
    elif cmd == "schedule_add":
        resp = call(sock_path, {"method": "schedule_add",
                                "id": rest[0], "cron_spec": rest[1]})
    elif cmd == "schedule_remove":
        resp = call(sock_path, {"method": "schedule_remove", "id": rest[0]})
    elif cmd == "schedule_list":
        resp = call(sock_path, {"method": "schedule_list"})
    elif cmd == "approval_respond":
        resp = call(sock_path, {"method": "approval_respond",
                                "intent_id": rest[0], "decision": rest[1]})
    else:
        print(f"unknown command: {cmd}", file=sys.stderr)
        sys.exit(2)
    print(json.dumps(resp, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ConnectionError, ValueError) as e:
        print(json.dumps({"transport_error": str(e)}))
        sys.exit(2)
