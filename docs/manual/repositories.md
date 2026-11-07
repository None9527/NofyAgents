# 模块仓库与声明组合

契约 `0.6`。仓库保存可复用源码，Agent 工程保存 `repository/name/version/digest`、别名、参数和接线；构建仍生成原生模块并使用统一 Loader。版本不可变，更新必须发布新版本并显式替换导入。它与 Git 远端、系统 release、generation、Session 状态分别管理。

## 从空目录开始：`module.template`

第一个包不必手写。`module.template`（命令行是 `nofy module init`，MCP 工具是 `nofy_module_template`）返回一个**已经能发布**的最小包源码：`module.json` 与 `source-files.json`，示例模块是一个 Rhai 工具（`--kind prompt` 则是静态提示词）。它是纯数据，命令行和 MCP 得到同样的结果，不读写内核。

```sh
nofy module init double --directory ./double      # 目录必须尚不存在，不会覆盖任何东西
nofy repository add local                         # origin 默认 managed，expected_revision 默认无
nofy module publish local --directory ./double    # expected_revision 缺省时用仓库当前的版本
```

MCP 调用同样的操作，把结果里的 `data.source` 改好后原样交给 `nofy_module_publish`。`source-files.json` 是**有意的白名单**：只有列在里面的文件才会进入不可变的包；模板把它按当前文件写好，作者改了文件之后重新核对即可。

`repository.add` 的 `origin` 和 `expected_revision` 有默认值（`managed` 与无），`module.publish` 缺省 `expected_revision` 时用仓库当前版本；这些默认值写在契约里，命令行和 MCP 行为一致。`repository.sync` 与 `repository.remove` 要求明确的版本，命令行和 MCP 都一样，不会替你读取。

## CLI 完整路径

先登记上传型仓库，把现有文件工具实现发布为可复用包：

```sh
nofy repository add local
nofy module publish local --directory ./presets/coding
nofy module list --repository local
nofy module inspect workspace-files --repository local --version 0.1.0
nofy module export workspace-files --repository local --version 0.1.0 --output workspace-files.tar.gz
```

`module publish --directory` 收集客户端目录的显式源码清单并上传。`module export --output` 写源码归档，已有输出默认拒绝覆盖。发布前，内核先用自己的工厂检查这个包，通过才会成为不可变版本；一个不通过，整个包不发布：

- 每个模块的工厂必须已安装；
- 模块配置必须符合工厂的配置模式，所有问题一次列出，不是只报第一个；
- 工厂需要的依赖端口必须绑定到种类相符的模块（包内模块或包输入），多出来的、名字不对的绑定也算问题；
- 不依赖其他模块的模块会试构建一次，所以不能编译的 Rhai 脚本在这里就被发现。

`$parameter`、`$setting`、`$input`、`$when` 等占位符在包被选用之前还不是最终值，不会被当成错误；占位符之外的问题照常报告。问题以 `error.details.issues` 返回，每条带指向 `module.json` 的 JSON Pointer。不会安装依赖、执行脚本、校验外部 Python 语法或限制包体大小。

已有 `coder` 工程可引用该包。先自行配置实际 Python 运行资源；下面的 `runtime` 指该工程中一个已登记的 resource 模块：

```sh
nofy agent module use coder \
  --repository local --name workspace-files --version 0.1.0 --alias files \
  --set /workspace=/absolute/workspace --bind environment=runtime \
  --export read --slot tool_packs
nofy agent module add coder --module-ref files.write --slot tool_packs
nofy agent module add coder --module-ref files.list --slot tool_packs
nofy agent module list coder
nofy agent build coder
nofy agent plan coder
nofy agent apply coder
nofy agent export coder --output coder.tar.gz
```

两个 Agent 可以复用同一包，各自提供 workspace 和 runtime。源码工程只存引用，包实现按摘要共享一份；别名将包内部 ID 隔离为 `files.file-read` 等。`files.read` 是公开导出名，编辑器负责解析到内部 ID。也可不指定 export/slot，只登记资源包，再用 `--bind asset=assets.main` 连到另一个包的公开导出。

`--set` 提供字符串，`--set-json` 提供 JSON 值，修改包参数；也可用 `--parameters '{...}'`。`--bind` 提供输入端口。MCP 直接使用结构化 parameters、bindings，无需生成中间 JSON 文件。包参数可使用 Agent 的 `$parameter` 等纯表达式；包源码不会读取 Host 任意文件或环境。

升级使用 `--replace-import`，替换单值插槽另加 `--replace-slot`。保留别名时，仍指向相同内部 ID 的使用者跟随新包；被移除的内部 ID 会在构建中报告缺项。`agent module unuse coder --alias files` 之前须 detach 该包的插槽并重新接线所有使用者。新版本发布不会自动改变旧声明、已发布 release 或运行中的 generation。

本地工程追加 `--project /absolute/project`。CLI 自动读取原 revision/digest 再写入，冲突即失败；自动读取不是覆盖许可。这一条只适用于 Agent 工程的编辑；仓库的 `sync` 与 `remove` 例外，命令行也要显式给出版本（见上）。MCP 写操作必须明确提供原 revision/digest。源码编辑可以暂时缺参数或端口，inspect 返回 incomplete，build/apply 才要求完整。

## 目录与 Git 来源

```sh
nofy repository add workspace-modules --host-directory /absolute/host/modules
nofy repository sync workspace-modules --expected-revision 0     # 上一步结果 refs.repository_revision
nofy repository add upstream --git-url https://example.org/team/modules.git --git-ref main --subdirectory modules
nofy repository sync upstream --expected-revision 0
nofy repository inspect upstream                                  # 读到当前 revision
nofy repository remove upstream --expected-revision 1
```

`sync` 与 `remove` 要求**明确的** `expected_revision`，命令行与 MCP 一致：它是你上一次读到的版本，版本变了就冲突，不会"读到什么就用什么"。缺了它，命令行在发出请求之前就报错并说明去哪里读。

Host 目录与客户端路径含义不同。目录源必须是 Host 上明确的规范绝对目录，位于内核私有状态目录之外；也不能把私有目录的祖先登记为来源。Git reference 默认 HEAD；sync 记录实际 commit。Git 仅读取提交对象，不 checkout、不运行客户端 Hook 或模块脚本；不安装依赖。凭据由 Host 的正常 Git/SSH 环境独立配置，不放在 URL 密码中。

注册来源本身不采集源码。sync 是唯一目录/Git 采集动作，整批包验证通过后才更新目录；同版本不同内容冲突时不发布其中任何新包。相同内容和相同快照在当前 revision 上重试幂等；过期 revision 仍然冲突。Git 引用变化不会在 build 时拉取。

移除仓库只解除来源注册，已发布包仍可查询及恢复现有引用。重新注册会取得新 revision，不能用删除前的旧 revision 写入。当前不提供自动垃圾回收或包版本删除。

## 包文件

仓库入口 `module-repository.json`：

```json
{"format":"nofy.module-repository/v1","packages":["prompts","tools"]}
```

packages 为相对目录，空字符串表示根包；每包包含 module.json 和 module-files.json 或 source-files.json。清单只包含实际交付的相对文件，包含清单自身；拒绝路径穿越、符号链接和特殊文件。已有 Agent 工程可用独立 module-files.json 表达包视图，复用同一实现文件。

```json
{
  "format":"nofy.module-package/v1",
  "name":"review-prompt",
  "version":"1.0.0",
  "parameters_schema":{
    "type":"object",
    "properties":{"text":{"type":"string","default":"Review the code."}}
  },
  "inputs":{},
  "modules":[{
    "reference":{"$module":"prompt"},
    "factory":"prompt.static",
    "config":{"text":{"$parameter":"/text"}}
  }],
  "exports":{"main":"prompt"}
}
```

内部模块用 `$module`，外部输入用 `{"$input":"environment"}`，inputs 声明所需 ModuleKind。支持原有纯声明表达式、包相对 `$file/$json`、条件模块和 `$literal`。包需要固定的内部 ID、factory 和公开导出；常规参数改变 config 或条件，不通过动态工厂名改变接口。parameters_schema 只能使用已包含的 Schema 资源，不会下载外部 `$ref` 文档；default/const 中的普通业务 JSON 保持字面含义。包间版本选择和接线均由声明显式表达，不隐式递归下载依赖包。

实现样例：[workspace-files](../../presets/coding/module.json)。六个工具为 read/write/edit/mkdir/list/search；Python 与外部依赖由用户提供。

## MCP 输入与离线导出

```json
{
  "target":{"kind":"project","project_id":"coder","expected_revision":"3"},
  "agent":"coder",
  "repository":"local",
  "name":"workspace-files",
  "version":"0.1.0",
  "alias":"files",
  "parameters":{"workspace":"/absolute/workspace"},
  "bindings":{"environment":"runtime"},
  "export":"read",
  "slot":"tool_packs"
}
```

这是 `nofy_agent_module_use` 的输入。完整工具为 `nofy_repository_add/list/inspect/sync/remove`、`nofy_module_template/publish/list/inspect/export`、`nofy_agent_module_use/unuse`。module.publish 的 source 为显式 Source 文件集合；MCP 不把客户端路径解释成 Host 路径。result.refs 提供 repository_revision、package_digest 等精确标识，取消等待后按原标识查询再决定是否重试。

Agent 导出与 project.pack 会在内存副本中加入 `.nofy-module-packages/<digest>.json`，保存完整包 Source 及精确文件字节。不改写托管声明，不包含模型凭据或外部解释器。解压后可运行 `nofy project build /absolute/export --offline`；后续 validate/apply 仍需要目标内核上可用的工厂、权限及运行资源。

读操作需要 read；托管仓库注册/移除和声明编辑需要 edit；目录/Git 登记与 sync 另需 resources；上传源码包需要 publish。最终权限由内核每次裁决。验收范围见[模块仓库记录](../verification/module-repositories.md)。
