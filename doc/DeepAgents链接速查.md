# DeepAgents.js 文档链接

| 注释 | 链接 |
|---|---|
| Deep Agents JavaScript 官方文档总览；优先阅读入口，了解 DeepAgents.js 的定位、能力范围、规划、文件系统、子 Agent、长期记忆等。 | https://docs.langchain.com/oss/javascript/deepagents/overview |
| Deep Agents JavaScript Quickstart；适合快速跑通第一个 Deep Agent，理解 createDeepAgent、工具、文件系统、子 Agent 的基础用法。 | https://docs.langchain.com/oss/javascript/deepagents/quickstart |
| Deep Agents JavaScript 自定义配置；查看 system prompt、tools、subagents、middleware、backend、checkpointer、skills、memory 等配置方式。 | https://docs.langchain.com/oss/javascript/deepagents/customization |
| Deep Agents JavaScript Tools 文档；查看如何给 DeepAgents.js 配置工具，以及工具如何被 Agent 调用。 | https://docs.langchain.com/oss/javascript/deepagents/tools |
| Deep Agents JavaScript Subagents 文档；查看如何配置子 Agent，适合我们项目里的 KnowledgeAgent、FactAgent、ContentAgent、ReviewAgent 等。 | https://docs.langchain.com/oss/javascript/deepagents/subagents |
| Deep Agents JavaScript Skills 文档；查看 Skills 的结构、加载方式和后端存储方式，适合我们项目的 Skill Package 设计。 | https://docs.langchain.com/oss/javascript/deepagents/skills |
| Deep Agents JavaScript Human-in-the-loop 文档；查看 interrupt_on / human approval，适合发布、删除、重建索引、激活规则等高风险工具审批。 | https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop |
| DeepAgents.js GitHub 仓库；查看源码、README、examples、issues 和实际包结构。 | https://github.com/langchain-ai/deepagentsjs |
| Deep Agents JavaScript API Reference；查看 DeepAgents.js 的完整 API 参考。 | https://reference.langchain.com/javascript/deepagents |
| createDeepAgent API Reference；查看 createDeepAgent 的具体参数和类型，是项目集成时最重要的 API 页面。 | https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent |
| Deep Agents Python / 主仓库；虽然项目使用 JS，但可以参考主仓库 README、设计理念和示例。 | https://github.com/langchain-ai/deepagents |
| LangChain Deep Agents 产品页；适合了解 Deep Agents 的整体定位：复杂多步骤任务、规划、上下文管理、多 Agent 编排。 | https://www.langchain.com/deep-agents |
| LangGraph JavaScript Interrupts 文档；理解中断、人工确认、暂停后恢复的底层机制。 | https://docs.langchain.com/oss/javascript/langgraph/interrupts |
| LangGraph JavaScript Persistence 文档；理解 checkpointer、thread、状态持久化和中断恢复。 | https://docs.langchain.com/oss/javascript/langgraph/persistence |
| LangChain JavaScript Agents 文档；理解普通 Agent 的工具循环、停止条件和迭代限制，可与 DeepAgents.js 对比。 | https://docs.langchain.com/oss/javascript/langchain/agents |
| LangChain JavaScript 文档总览；查看 LangChain JS 其他相关能力。 | https://docs.langchain.com/oss/javascript/langchain/overview |
| LangChain / LangGraph / Deep Agents API Reference 总入口；查 API 时可以从这里进入。 | https://reference.langchain.com/ |
| Deep Agents UI GitHub；可参考 Deep Agents 的 UI 交互方式，包括任务计划、工具执行、文件系统等展示思路。 | https://github.com/langchain-ai/deep-agents-ui |

## DeepAgents.js 在项目中的安装与接入

| 注释 | 链接 / 命令 |
|---|---|
| 在项目根目录安装 DeepAgents.js。 | `npm install deepagents` |
| 如果项目还没有安装 LangChain / LangGraph 相关依赖，可以同时安装。 | `npm install deepagents @langchain/core @langchain/langgraph` |
| npm 官方包页面；确认包名、版本、安装命令和依赖信息。 | https://www.npmjs.com/package/deepagents |
| DeepAgents.js 应放在 Electron Main Process 中使用，不建议直接在 React Renderer 中运行；它会调用模型、工具、本地文件、SQLite、审批恢复等能力，这些能力都应放在主进程，Renderer 通过 IPC 调用。 | `electron/services/agent/` |
| 推荐封装入口，避免业务层直接依赖 DeepAgents API。 | `electron/services/agent/geoAgentFactory.ts` |
| 推荐主运行时入口，负责上下文构建、allowed actions、动态工具暴露、DeepAgents 调用和恢复。 | `electron/services/agent/geoAgentRuntime.ts` |
| 推荐最小接入顺序：先安装依赖，再接低风险工具，最后接审批、checkpointer 和高风险工具。 | `install → geoAgentFactory → answer_user/kb.search → agent_tasks/execution_ledger → AllowedActionPolicy → DynamicToolRegistry → ToolGuard → interrupt_on/checkpointer` |
| 不建议一开始暴露发布、删除、重建索引、批量修改事实等高风险工具。 | `publish.article / project.delete / kb.reindex_all / fact.batch_update / hypothesis.activate` |
| 高风险工具后续必须通过 DeepAgents human-in-the-loop / interrupt_on 与本地 tool_approvals 结合。 | https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop |
| DeepAgents.js API Reference，可查看 createDeepAgent 的参数和类型。 | https://reference.langchain.com/javascript/deepagents |
| createDeepAgent API Reference；项目封装 geoAgentFactory 时重点参考。 | https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent |
| LangGraph Persistence 文档；接入 checkpointer、thread_id、中断恢复时重点参考。 | https://docs.langchain.com/oss/javascript/langgraph/persistence |
| LangGraph Interrupts 文档；理解人工审批、中断、resume 的底层机制。 | https://docs.langchain.com/oss/javascript/langgraph/interrupts |

