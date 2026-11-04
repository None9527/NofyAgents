# GCC C工具链依赖测量（M3d3-1）

本阶段完成的是实际工作负载输入及正式打包拒绝的定位，尚未通过Agent内GCC编译。没有扩大协议上限、接入宿主PATH/库或把GCC/Python变成内核强制依赖。

## 实际输入

私有证据目录`/tmp/nofy-m3d3-toolchain.bStvu8`包含`project/total.c`、测试准备器`prepare.py`、显式原生`capture.json`及逐文件摘要/来源/大小清单`inventory.json`。沿用M3d2的选取Python依赖，加入当前已安装GCC15.2.0、target=x86_64-linux-gnu：gcc驱动、cc1、collect2、汇编器、链接器、lto-wrapper、链接插件、启动对象、libgcc、glibc/pthread/libm链接输入，以及该真实C源预处理取得的75份头文件。

测试准备器只对本机受信任工具链执行版本/路径/预处理清单查询与ELF依赖列举；正式生产capture仍只读取显式文件定义，不执行模块或发现宿主依赖。具体版本由本次本机查询确认，不把工具链名称当成已验证版本。

| 观察项 | 结果 |
|---|---|
| 显式映像文件 | 235 |
| 唯一内容blob | 215 |
| 解码字节，含声明路径别名 | 91459091 |
| 对唯一内容实际gzip(level6)测量 | 30722180字节 |
| 对上述gzip计算base64长度 | 40963160字节，尚不含manifest/JSON结构 |
| 正式发行capture | 退出1，`captured runtime blobs exceed wire limit` |
| 新真实模型调用 | 0 |

gzip测量来自测试准备器，不等同Rust封装器的最终wire字节；不得把40963160写成已经生成的正式映像文件大小。正式工具尚未输出gcc-image.json，说明当前24MiB wire接纳不足，但该拒绝本身尚不能证明清单已足够支持guest内全部编译阶段。

## 宿主预检与未通过项

固定受信任C源使用int64求和、pthread工作线程、strtod参数检查及libm sqrt。宿主预检命令为：

```sh
/usr/bin/gcc -std=c17 -Wall -Wextra -Werror -O2 -pthread /tmp/nofy-m3d3-toolchain.bStvu8/project/total.c -lm -o /tmp/nofy-m3d3-toolchain.bStvu8/host-precheck
/tmp/nofy-m3d3-toolchain.bStvu8/host-precheck 81
```

两个命令退出0，实际输出`native-gcc total=32 sqrt=9.000`。这仅证明测试源和本机工具链可用，不是框架内编译/链接/执行、锁定环境完整性、审批或恢复验收。清单针对当前C工作负载，不声称完整C++、sanitizer、LTO或任意C项目环境；不能为了适应旧尺寸而删掉实际所需依赖并继续宣称同样能力。

用户随后明确交付不携带依赖，只携带可重建清单；原容量治理方案已撤销。本次测量保留为旧内嵌方案的实际限制证据，不再据此扩大Agent包体上限。下一实施边界见`docs/architecture/dependency-reconstruction-contract.md`：先拆开项目交付与依赖重建，再通过目标环境的实际GCC编译/链接/运行验收。不得靠宿主路径回退、换更小的编译器或把宿主预检当成功关闭缺口。
