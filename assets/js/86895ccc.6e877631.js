"use strict";(self.webpackChunkdhenara_docs=self.webpackChunkdhenara_docs||[]).push([[726],{3886:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>s,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"why-dhenara/langchain-vs-dhenara","title":"Dhenara vs. LangChain","description":"Here we compares Dhenara with LangChain, highlighting key differences and advantages to help you choose the right framework for your AI applications.","source":"@site/docs/why-dhenara/langchain-vs-dhenara.md","sourceDirName":"why-dhenara","slug":"/why-dhenara/langchain-vs-dhenara","permalink":"/why-dhenara/langchain-vs-dhenara","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"docsSidebar","previous":{"title":"Why Dhenara","permalink":"/why-dhenara/"},"next":{"title":"Overview","permalink":"/features/features-overview"}}');var a=i(4848),t=i(8453);const s={},o="Dhenara vs. LangChain",l={},d=[{value:"At a Glance: Dhenara vs. LangChain",id:"at-a-glance-dhenara-vs-langchain",level:2},{value:"Key Advantages of Dhenara",id:"key-advantages-of-dhenara",level:2},{value:"1. Simplified Architecture",id:"1-simplified-architecture",level:3},{value:"2. Strong Typing and Validation",id:"2-strong-typing-and-validation",level:3},{value:"3. Cross-Provider Flexibility",id:"3-cross-provider-flexibility",level:3},{value:"4. Built-in Usage and Cost Tracking",id:"4-built-in-usage-and-cost-tracking",level:3},{value:"5. Simplified Streaming",id:"5-simplified-streaming",level:3},{value:"6. Test Mode for Rapid Development",id:"6-test-mode-for-rapid-development",level:3},{value:"7. Less Boilerplate Code",id:"7-less-boilerplate-code",level:3},{value:"8. Direct Control Flow",id:"8-direct-control-flow",level:3},{value:"How LangChain Would Handle the Same Example",id:"how-langchain-would-handle-the-same-example",level:2},{value:"Resource Configuration",id:"resource-configuration",level:2},{value:"Dhenara&#39;s ResourceConfig Advantage",id:"dhenaras-resourceconfig-advantage",level:3},{value:"Key Limitations of LangChain in this Use Case",id:"key-limitations-of-langchain-in-this-use-case",level:2},{value:"When to Choose Dhenara Over LangChain",id:"when-to-choose-dhenara-over-langchain",level:2},{value:"Conclusion",id:"conclusion",level:2}];function c(e){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,t.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"dhenara-vs-langchain",children:"Dhenara vs. LangChain"})}),"\n",(0,a.jsx)(n.p,{children:"Here we compares Dhenara with LangChain, highlighting key differences and advantages to help you choose the right framework for your AI applications."}),"\n",(0,a.jsx)(n.h2,{id:"at-a-glance-dhenara-vs-langchain",children:"At a Glance: Dhenara vs. LangChain"}),"\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Feature"}),(0,a.jsx)(n.th,{children:"Dhenara"}),(0,a.jsx)(n.th,{children:"LangChain"})]})}),(0,a.jsxs)(n.tbody,{children:[(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Architecture"})}),(0,a.jsx)(n.td,{children:"Clean, direct architecture with minimal abstraction layers"}),(0,a.jsx)(n.td,{children:"Multiple layers of abstraction (chains, memory, callbacks)"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Type Safety"})}),(0,a.jsx)(n.td,{children:"Strong typing throughout with Pydantic validation"}),(0,a.jsx)(n.td,{children:"Limited type safety, particularly across providers"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Cross-Provider Support"})}),(0,a.jsx)(n.td,{children:"Seamless provider switching with unified API"}),(0,a.jsx)(n.td,{children:"Provider switching requires manual memory synchronization"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Conversation Management"})}),(0,a.jsxs)(n.td,{children:["Direct, explicit control with ",(0,a.jsx)(n.code,{children:"ConversationNode"})]}),(0,a.jsx)(n.td,{children:"Complex memory systems with varying implementations"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Streaming"})}),(0,a.jsx)(n.td,{children:"Simplified streaming with automatic consolidation"}),(0,a.jsx)(n.td,{children:"Multiple callback systems for streaming"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Usage Tracking"})}),(0,a.jsx)(n.td,{children:"Built-in cost and token tracking across providers"}),(0,a.jsx)(n.td,{children:"Limited or manual cost tracking"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Test Mode"})}),(0,a.jsx)(n.td,{children:"Built-in test mode for rapid development"}),(0,a.jsx)(n.td,{children:"Requires manual mocking"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Sync/Async"})}),(0,a.jsx)(n.td,{children:"Unified sync/async interfaces"}),(0,a.jsx)(n.td,{children:"Mixed sync/async implementations"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Boilerplate"})}),(0,a.jsx)(n.td,{children:"Minimal setup code required"}),(0,a.jsx)(n.td,{children:"Significant boilerplate for complex scenarios"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Learning Curve"})}),(0,a.jsx)(n.td,{children:"Transparent design patterns"}),(0,a.jsx)(n.td,{children:"Steep learning curve with many abstractions"})]})]})]}),"\n",(0,a.jsx)(n.h2,{id:"key-advantages-of-dhenara",children:"Key Advantages of Dhenara"}),"\n",(0,a.jsx)(n.h3,{id:"1-simplified-architecture",children:"1. Simplified Architecture"}),"\n",(0,a.jsxs)(n.p,{children:["Dhenara uses a more straightforward approach to managing conversation context. The ",(0,a.jsx)(n.code,{children:"ConversationNode"})," structure directly captures all necessary information without the additional layers of abstraction that LangChain introduces with its chains, memory types, and callbacks."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Dhenara's clean approach\nnode = ConversationNode(\n    user_query=query,\n    attached_files=[],\n    response=response.chat_response,\n    timestamp=datetime.datetime.now().isoformat(),\n)\nconversation_nodes.append(node)\n"})}),"\n",(0,a.jsx)(n.h3,{id:"2-strong-typing-and-validation",children:"2. Strong Typing and Validation"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara leverages Pydantic models throughout the library, ensuring that data structures are properly validated at runtime. This helps catch mistakes early and provides better IDE support with type hints."}),"\n",(0,a.jsx)(n.p,{children:"Every response follows a consistent pattern:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:'# Consistent response structure\nchat_response = ChatResponse(\n    model="gpt-4o",\n    provider=AIModelProviderEnum.OPEN_AI,\n    usage=ChatResponseUsage(...),\n    usage_charge=UsageCharge(...),\n    choices=[...],\n    metadata={...}\n)\n'})}),"\n",(0,a.jsx)(n.h3,{id:"3-cross-provider-flexibility",children:"3. Cross-Provider Flexibility"}),"\n",(0,a.jsxs)(n.p,{children:["Dhenara's implementation allows seamless switching between providers (OpenAI, Anthropic, Google) while maintaining conversation context. The ",(0,a.jsx)(n.code,{children:"PromptFormatter"})," automatically handles the conversion between different provider formats."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Effortlessly switch models between turns\nmodel_endpoint = random.choice(all_model_endpoints)  # Can select from any provider\n"})}),"\n",(0,a.jsx)(n.h3,{id:"4-built-in-usage-and-cost-tracking",children:"4. Built-in Usage and Cost Tracking"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara provides automatic tracking of token usage and associated costs across all providers:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Usage data automatically included in responses\nresponse.chat_response.usage  # ChatResponseUsage with token counts\nresponse.chat_response.usage_charge  # Cost information including price calculations\n"})}),"\n",(0,a.jsx)(n.h3,{id:"5-simplified-streaming",children:"5. Simplified Streaming"}),"\n",(0,a.jsx)(n.p,{children:"Streaming is handled through a unified interface that works consistently across providers:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Streaming with Dhenara\nconfig = AIModelCallConfig(streaming=True)\nclient = AIModelClient(model_endpoint, config)\n\nasync for chunk, final_response in client.generate_async(...):\n    # Process each chunk as it arrives\n    print(chunk.data.choice_deltas[0].content_deltas[0].text_delta)\n"})}),"\n",(0,a.jsx)(n.h3,{id:"6-test-mode-for-rapid-development",children:"6. Test Mode for Rapid Development"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara includes a built-in test mode that doesn't require API credentials:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Enable test mode for rapid development without API calls\nconfig = AIModelCallConfig(test_mode=True)\nclient = AIModelClient(model_endpoint, config)\nresponse = client.generate(prompt=prompt)\n"})}),"\n",(0,a.jsx)(n.h3,{id:"7-less-boilerplate-code",children:"7. Less Boilerplate Code"}),"\n",(0,a.jsx)(n.p,{children:"The Dhenara implementation requires significantly less setup code compared to LangChain's equivalent functionality:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# LangChain equivalent would require:\n# - Setting up a memory object\n# - Configuring a chain\n# - Creating provider-specific clients\n# - Setting up callbacks for logging\n"})}),"\n",(0,a.jsx)(n.h3,{id:"8-direct-control-flow",children:"8. Direct Control Flow"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara gives developers explicit control over the conversation flow without hiding it behind abstractions:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:"# Direct access to get context and manage turns\ncontext = get_context(conversation_nodes, endpoint.ai_model)\nresponse = client.generate(prompt=prompt, context=context, instructions=instructions)\n"})}),"\n",(0,a.jsx)(n.h2,{id:"how-langchain-would-handle-the-same-example",children:"How LangChain Would Handle the Same Example"}),"\n",(0,a.jsx)(n.p,{children:"For comparison, here's how a similar multi-turn conversation might be implemented with LangChain:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:'from langchain.chains import ConversationChain\nfrom langchain.memory import ConversationBufferMemory\nfrom langchain_openai import ChatOpenAI\nfrom langchain_anthropic import ChatAnthropic\nfrom langchain_google_genai import ChatGoogleGenerativeAI\n\n# Setup providers\nopenai_llm = ChatOpenAI(model_name="gpt-4o-mini")\nanthropic_llm = ChatAnthropic(model="claude-3-5-haiku")\ngoogle_llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")\n\n# Dictionary to track LLM chains for each provider\nllm_chains = {\n    "openai": ConversationChain(\n        llm=openai_llm,\n        memory=ConversationBufferMemory(),\n        verbose=True\n    ),\n    "anthropic": ConversationChain(\n        llm=anthropic_llm,\n        memory=ConversationBufferMemory(),\n        verbose=True\n    ),\n    "google": ConversationChain(\n        llm=google_llm,\n        memory=ConversationBufferMemory(),\n        verbose=True\n    )\n}\n\n# This is where LangChain gets complicated - cross-provider memory sharing\n# requires manual handling of memory state\ndef sync_memories(from_chain, to_chain):\n    # Need to extract conversation from one memory and add to another\n    # This is non-trivial in LangChain and requires understanding internal structures\n    conversation = from_chain.memory.buffer\n    to_chain.memory.buffer = conversation\n\n# Execute conversation turns\nqueries = [\n    "Tell me a short story about a robot learning to paint.",\n    "Continue the story but add a twist where the robot discovers something unexpected.",\n    "Conclude the story with an inspiring ending."\n]\n\ninstructions = [\n    "Be creative and engaging.",\n    "Build upon the previous story seamlessly.",\n    "Bring the story to a satisfying conclusion."\n]\n\n# Need to keep track of which provider was used last\nlast_provider = None\ncurrent_chain = None\n\nfor i, query in enumerate(queries):\n    # Select provider (randomly or in sequence)\n    providers = ["openai", "anthropic", "google"]\n    current_provider = random.choice(providers)\n    current_chain = llm_chains[current_provider]\n\n    # Sync memory if switching providers\n    if last_provider and last_provider != current_provider:\n        sync_memories(llm_chains[last_provider], current_chain)\n\n    # Need to inject the system prompt/instructions manually\n    # LangChain has limited support for per-turn instructions\n    enriched_query = f"{instructions[i]}\\n\\nUser: {query}"\n\n    # Generate response\n    response = current_chain.predict(input=enriched_query)\n\n    print(f"User: {query}")\n    print(f"Model: {current_provider}")\n    print(f"Response: {response}")\n    print("-" * 80)\n\n    last_provider = current_provider\n'})}),"\n",(0,a.jsx)(n.h2,{id:"resource-configuration",children:"Resource Configuration"}),"\n",(0,a.jsxs)(n.table,{children:[(0,a.jsx)(n.thead,{children:(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.th,{children:"Feature"}),(0,a.jsx)(n.th,{children:"Dhenara"}),(0,a.jsx)(n.th,{children:"LangChain"})]})}),(0,a.jsxs)(n.tbody,{children:[(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Credential Management"})}),(0,a.jsx)(n.td,{children:"Centralized YAML configuration with runtime loading"}),(0,a.jsx)(n.td,{children:"Environment variables or manual client setup"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Model Organization"})}),(0,a.jsx)(n.td,{children:"Structured model registry with provider metadata"}),(0,a.jsx)(n.td,{children:"Ad-hoc model instantiation"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Provider Switching"})}),(0,a.jsx)(n.td,{children:"Single config with dynamic model selection"}),(0,a.jsx)(n.td,{children:"Manual client reconfiguration"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Endpoint Management"})}),(0,a.jsx)(n.td,{children:"Automatic endpoint creation from models and APIs"}),(0,a.jsx)(n.td,{children:"Manual endpoint setup"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Resource Querying"})}),(0,a.jsx)(n.td,{children:"Rich query interface for resource retrieval"}),(0,a.jsx)(n.td,{children:"No centralized resource management"})]}),(0,a.jsxs)(n.tr,{children:[(0,a.jsx)(n.td,{children:(0,a.jsx)(n.strong,{children:"Multi-environment Support"})}),(0,a.jsx)(n.td,{children:"Multiple resource configs for different environments"}),(0,a.jsx)(n.td,{children:"Manual environment handling"})]})]})]}),"\n",(0,a.jsx)(n.h3,{id:"dhenaras-resourceconfig-advantage",children:"Dhenara's ResourceConfig Advantage"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara introduces a centralized resource management system that dramatically simplifies working with multiple AI models and providers:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:'# Load all credentials and initialize endpoints in one line\nresource_config = ResourceConfig()\nresource_config.load_from_file("credentials.yaml", init_endpoints=True)\n\n# Get any model by name, regardless of provider\nclaude_endpoint = resource_config.get_model_endpoint("claude-3-5-haiku")\ngpt4_endpoint = resource_config.get_model_endpoint("gpt-4o")\n\n# Or use a more specific query when needed\ngemini_endpoint = resource_config.get_resource(\n    ResourceConfigItem(\n        item_type=ResourceConfigItemTypeEnum.ai_model_endpoint,\n        query={"model_name": "gemini-1.5-flash", "api_provider": "google_gemini_api"}\n    )\n)\n'})}),"\n",(0,a.jsx)(n.p,{children:"In contrast, LangChain requires setting up each model client individually:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-python",children:'from langchain_openai import ChatOpenAI\nfrom langchain_anthropic import ChatAnthropic\nfrom langchain_google_genai import ChatGoogleGenerativeAI\n\n# Manual setup for each provider\nopenai_model = ChatOpenAI(api_key=os.environ["OPENAI_API_KEY"], model="gpt-4o")\nanthropic_model = ChatAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"], model="claude-3-haiku")\ngoogle_model = ChatGoogleGenerativeAI(api_key=os.environ["GOOGLE_API_KEY"], model="gemini-1.5-flash")\n\n# No centralized way to retrieve models by name or query\n# Must manually track which model is which\n'})}),"\n",(0,a.jsx)(n.p,{children:"Dhenara's ResourceConfig provides a more maintainable, structured approach to managing AI resources, especially in applications that use multiple models across different providers."}),"\n",(0,a.jsx)(n.h2,{id:"key-limitations-of-langchain-in-this-use-case",children:"Key Limitations of LangChain in this Use Case"}),"\n",(0,a.jsxs)(n.ol,{children:["\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Complex Memory Synchronization"}),": LangChain doesn't natively support sharing memory across different provider chains, requiring manual memory synchronization."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Opaque Memory Structure"}),": The internal representation of conversation history is less transparent and harder to manipulate directly."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Provider Switching Complexity"}),": Switching between providers requires creating separate chains and manually transferring context."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Per-Turn Instructions"}),": LangChain's design makes it difficult to vary system instructions on a per-turn basis."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Verbose Configuration"}),": Requires more boilerplate code to set up chains, memory, and callbacks."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Limited Usage Tracking"}),": Cost tracking is not built-in across providers and requires additional setup."]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:["\n",(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.strong,{children:"Inconsistent Streaming"}),": Streaming implementations vary across providers and require different callback setups."]}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"when-to-choose-dhenara-over-langchain",children:"When to Choose Dhenara Over LangChain"}),"\n",(0,a.jsx)(n.p,{children:"Dhenara is likely the better choice when:"}),"\n",(0,a.jsxs)(n.ol,{children:["\n",(0,a.jsx)(n.li,{children:"You need seamless multi-provider conversation support"}),"\n",(0,a.jsx)(n.li,{children:"You want direct control over conversation state"}),"\n",(0,a.jsx)(n.li,{children:"You prefer clean, strongly-typed interfaces"}),"\n",(0,a.jsx)(n.li,{children:"Your application needs per-turn instruction customization"}),"\n",(0,a.jsx)(n.li,{children:"You require built-in usage and cost tracking"}),"\n",(0,a.jsx)(n.li,{children:"You value simplified streaming implementations"}),"\n",(0,a.jsx)(n.li,{children:"You need both sync and async interfaces with consistent behavior"}),"\n",(0,a.jsx)(n.li,{children:"You want a lower learning curve with more transparent design patterns"}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"LangChain may still be preferable if you're using its extensive collection of tools, agents, and integrations beyond simple conversation management."}),"\n",(0,a.jsx)(n.h2,{id:"conclusion",children:"Conclusion"}),"\n",(0,a.jsx)(n.p,{children:"For multi-turn conversations specifically, Dhenara provides a more elegant, flexible, and developer-friendly approach compared to LangChain.\nThe design prioritizes simplicity and direct control while still offering powerful features like cross-provider compatibility, usage tracking, and contextual awareness."}),"\n",(0,a.jsx)(n.p,{children:"Rather than hiding complexity behind layers of abstraction, Dhenara gives developers clear patterns that are easy to understand, extend, and debug \u2013 making it particularly well-suited for production applications that need reliability and maintainability."})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(c,{...e})}):c(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>s,x:()=>o});var r=i(6540);const a={},t=r.createContext(a);function s(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);