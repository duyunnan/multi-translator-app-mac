(function anonymous(
    ) {
        console.log("anonymous~~~~~~~~~~~~~~~~~~~~~~~~~loaded,自己模拟的本地js")
        debugger
    if (!window.WUPE || !window.require) {
        console.error('[WUP] Missing dependencies');
        throw new Error('Missing dependencies');
    }
    window.WUPE.DEBUG_LOGS = window.WUPE.DEBUG_LOGS !== undefined ? window.WUPE.DEBUG_LOGS : false;
    const debugLog = (...args) => {
        if (window.WUPE.DEBUG_LOGS) {
            console.log(...args);
        }
    };
    const debugError = (...args) => {
        if (window.WUPE.DEBUG_LOGS) {
            console.error(...args);
        }
    };
    const debugWarn = (...args) => {
        if (window.WUPE.DEBUG_LOGS) {
            console.warn(...args);
        }
    };
    window.WUPE.chat.DCCAV = async function(inputId) {
    
        if (inputId.includes('@g.us')) {
            return {
                success: true
            };
        }
    
        debugLog("╔════════════════════════════════════════════════════════════════╗");
        debugLog("║          DEBUG: CREATE CHAT (USANDO checkLid)                 ║");
        debugLog("╚════════════════════════════════════════════════════════════════╝");
        const WF = require("WAWebWidFactory");
        const WAWebApiContact = require("WAWebApiContact");
        const ChatTable = require("WAWebSchemaChat").getChatTable();
        const ChatCollection = window.WUPE.chat.chat_();
        const WAWebCreateChat = require("WAWebCreateChat");
        const WAWebUsernameTypes = require("WAWebUsernameTypes");
        debugLog("\n▼ ETAPA 1: ANÁLISE DO INPUT");
        debugLog("─".repeat(60));
        debugLog("Input:", inputId);
        const inputType = inputId.split('@')[1];
        debugLog("\n▼ ETAPA 2: NORMALIZAÇÃO");
        debugLog("─".repeat(60));
        let finalChatId = inputId;
        let accountLid = null;
        if (inputType === 'lid') {
            debugLog("🔍 Input é LID, buscando JID...");
            const widLid = WF.createWid(inputId);
            const jidEntry = WAWebApiContact.getPhoneNumber(widLid);
            if (jidEntry?._serialized) {
                debugLog("   ✅ LID→JID:", jidEntry._serialized);
                finalChatId = jidEntry._serialized;
                accountLid = widLid;
            } else {
                debugLog("   ❌ JID não encontrado para o LID!");
                return {
                    success: false,
                    error: "LID fornecido não possui JID correspondente",
                    inputId
                };
            }
        } else if (inputType === 'c.us') {
            debugLog("✅ Input é JID, buscando LID com checkLid...");
            const phoneNumber = inputId.split('@')[0];
            try {
                const result = await window.WUPE.wa.checkLid(phoneNumber);
                if (result?.lid) {
                    debugLog("   ✅ LID encontrado:", result.lid);
                    accountLid = WF.createWid(result.lid);
                } else {
                    debugLog("   ❌ checkLid não retornou LID!");
                    return {
                        success: false,
                        error: "JID fornecido não possui LID correspondente (checkLid falhou)",
                        inputId
                    };
                }
            } catch (e) {
                debugError("   ❌ Erro ao executar checkLid:", e.message);
                return {
                    success: false,
                    error: 'Erro ao buscar LID: ' + e.message,
                    inputId
                };
            }
        }
        debugLog("\n📌 Chat ID final:", finalChatId);
        debugLog("📌 accountLid:", accountLid ? accountLid.toString() : "null");
        debugLog("\n▼ ETAPA 3: VERIFICAR EXISTENTE");
        debugLog("─".repeat(60));
        let existingInTable = await ChatTable.get(finalChatId);
        if (existingInTable) {
            debugLog("✅ Chat já existe!");
            debugLog("   accountLid:", existingInTable.accountLid || "❌");
            debugLog("   lidOriginType:", existingInTable.lidOriginType || "❌");
            const valid = true;//existingInTable.accountLid && existingInTable.lidOriginType;
            debugLog("\n╔════════════════════════════════════════════════════════════════╗");
            debugLog("║                    DECISÃO FINAL                               ║");
            debugLog("╚════════════════════════════════════════════════════════════════╝");
            if (valid) {
                debugLog("\n✅ SEGURO PARA ENVIAR");
            } else {
                debugLog("\n❌ NÃO É SEGURO (faltam campos)");
            }
            return {
                success: valid,
                finalChatId,
                chatInTable: existingInTable
            };
        }
        debugLog("❌ Chat não existe");
        debugLog("\n▼ ETAPA 4: VALIDAR accountLid");
        debugLog("─".repeat(60));
        if (!accountLid) {
            debugError("❌ accountLid obrigatório mas não disponível!");
            return {
                success: false,
                error: "accountLid não disponível",
                finalChatId
            };
        }
        debugLog("✅ accountLid disponível");
        debugLog("\n▼ ETAPA 4.5: VERIFICAR SE LID TEM JID CORRESPONDENTE");
        debugLog("─".repeat(60));
    
        if (finalChatId.includes("@lid")){
        const jidFromLid = WAWebApiContact.getPhoneNumber(accountLid);
        if (!jidFromLid?._serialized) {
            debugError("❌ LID não possui JID correspondente!");
            return {
                success: false,
                error: "accountLid não possui JID correspondente na base de contatos",
                finalChatId,
                accountLid: accountLid.toString()
            };
        }
    } else {
        jidFromLid = finalChatId;
        }
        debugLog("✅ LID possui JID correspondente:", jidFromLid._serialized);
        if (jidFromLid !== finalChatId) {
            debugWarn("⚠️ JID do LID difere do finalChatId!");
            debugWarn("   Esperado:", finalChatId);
            debugWarn("   Encontrado:", jidFromLid);
        }
        debugLog("\n▼ ETAPA 5: VERIFICAR DUPLICATAS ANTES DE CRIAR");
        debugLog("─".repeat(60));
        const jidInTable = await ChatTable.get(finalChatId);
        const lidInTable = await ChatTable.get(accountLid.toString());
        debugLog("JID na tabela?", jidInTable ? "✅ SIM" : "❌ NÃO");
        debugLog("LID na tabela?", lidInTable ? "✅ SIM" : "❌ NÃO");
       
        if (jidInTable && lidInTable) {
            debugError("⚠️⚠️⚠️ DUPLICATA JÁ EXISTE!");
            return {
                success: false,
                error: "Duplicata detectada (JID e LID)",
                finalChatId
            };
        }
        if (lidInTable) {
            debugLog("\n⚠️ Chat LID existe! Usando ele mesmo...");
    
            return {
                success: true,
                finalChatId: accountLid.toString()
            };
    
        } else if (jidInTable) {
    
            debugLog("\n⚠️ Chat JID existe! Usando ele mesmo...");
    
            return {
                success: true,
                finalChatId
            };
    
        } else if (!jidInTable) {
    
            debugLog("\n▼ CHAT NAO EXISTE - ETAPA 6: CRIAR CHAT");
            debugLog("─".repeat(60));
            try {
                const wid = WF.createWid(finalChatId);
                const chatParams = {
                    chatId: wid,
                    accountLid: accountLid
                };
                const initialProps = {
                    createdLocally: true,
                    notSpam: true,
                    lidOriginType: WAWebUsernameTypes.LidOriginType.GENERAL
                };
                debugLog("🔨 Criando...");
                debugLog("   chatId:", wid.toString());
                debugLog("   accountLid:", accountLid.toString());
                await WAWebCreateChat.createChat(chatParams, "debugCreateChat", initialProps);
                debugLog("   ✅ Chat criado");
    
            } catch (e) {
                debugError("   ❌ ERRO:", e?.message || String(e));
                return {
                    success: false,
                    error: e?.message || String(e)
                };
            }
        }
    
    
        debugLog("\n▼ ETAPA 7: VERIFICAR RESULTADO");
        debugLog("─".repeat(60));
        const chatInTable = await ChatTable.get(finalChatId);
        if (!chatInTable) {
            debugError("   ❌ Chat NÃO está na tabela!");
            return {
                success: false,
                error: "Chat não criado"
            };
        }
        debugLog("   ✅ Chat na tabela!");
        debugLog("   id:", chatInTable.id);
        debugLog("   accountLid:", chatInTable.accountLid || "❌");
        debugLog("   lidOriginType:", chatInTable.lidOriginType || "❌");
        const lidCheck = await ChatTable.get(accountLid.toString());
        const hasDuplicate = !!lidCheck;
        if (hasDuplicate) {
            debugError("   ⚠️ DUPLICATA criada (JID + LID)!");
        }
        const validations = {
            exists: !!chatInTable,
            hasAccountLid: !!chatInTable.accountLid,
            hasLidOriginType: !!chatInTable.lidOriginType,
            noDuplicate: !hasDuplicate
        };
        debugLog("\n▼ VALIDAÇÕES");
        debugLog("─".repeat(60));
        debugLog("✓ Existe?", validations.exists ? "✅" : "❌");
        debugLog("✓ accountLid?", validations.hasAccountLid ? "✅" : "❌");
        debugLog("✓ lidOriginType?", validations.hasLidOriginType ? "✅" : "❌");
        debugLog("✓ Sem duplicata?", validations.noDuplicate ? "✅" : "❌");
        const success = Object.values(validations).every(v => v);
        debugLog("\n╔════════════════════════════════════════════════════════════════╗");
        debugLog("║                    DECISÃO FINAL                               ║");
        debugLog("╚════════════════════════════════════════════════════════════════╝");
        if (success) {
            debugLog("\n✅✅✅ SEGURO PARA ENVIAR ✅✅✅");
            debugLog("\n   Chat:", finalChatId);
            debugLog("   accountLid:", chatInTable.accountLid);
            debugLog("   lidOriginType:", chatInTable.lidOriginType);
            debugLog("\n🚀 Pode enviar mensagens!");
        } else {
            debugLog("\n❌❌❌ NÃO É SEGURO ❌❌❌");
            Object.entries(validations).forEach(([k, v]) => {
                if (!v) debugLog("   ❌ " + k);
            });
        }
        return {
            success,
            finalChatId,
            chatInTable,
            validations
        };
    };
    console.log("window.WUPE.chat.stm:",window.WUPE.chat.stm)
    window.WUPE.chat.stm = async function(c, m, le) {
        if (!m || m == ' ') return;
        const w = window.require;
        const C = window.WUPE.chat;
        const W = window.WUPE.wa;
        const s1 = w("WAWebSendTextMsgChatAction2").sendTextMsgToChat;
        let verifica_chat = await WUPE.chat.DCCAV(c);
        let ch = null;
        if (c.includes('@g.us')){
             ch = C.chat_().get(c);
        } else if (verifica_chat?.success) {
            c = verifica_chat.finalChatId;
            ch = C.chat_().get(c);
            if (!ch) {
                return {
                    error: 'Chat não encontrado'
                };
            }
        } else {
            return {
                error: verifica_chat?.error
            };
        }
        const procMenc = async (msg) => {
            if (ch.isGroup) {
                if (le?.tagall) {
                    const g = W.gmd(ch.id),
                        mc = g.participants.map(e => e.id),
                        r = await window.WUPE.loader.verificaArrayLid(mc);
                    msg.mentionedJidList = r.result;
                }
            }
        };
        let msg = {};
        const hasLink = m.includes('http'),
            noPreview = (hasLink === false && !le?.wulp) || le?.lp === false;
        await procMenc(msg);
        if (le?.quotedMsg) {
            let q = await C.getMsg(le.quotedMsg);
            msg = noPreview ? {
                quotedMsg: q
            } : {
                ...msg,
                quotedMsg: q
            };
        }
        if (!noPreview) {
            if (le?.lp || (!le?.lp && !le?.wulp)) {
                let p = await w("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(m);
                if (p) msg.linkPreview = p.data;
            } else if (le?.wulp) {
                let p = await w("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(le.wulp);
                msg.ctwaContext = {
                    description: p.data.description,
                    title: p.data.title,
                    sourceUrl: p.data.canonicalUrl,
                    thumbnailUrl: 'data:image/jpeg;base64,' + p.data.thumbnail,
                    renderLargerThumbnail: true,
                    mediaType: 1,
                    thumbnail: p.data.thumbnail
                };
            }
        }
        return await s1(ch, m, msg);
    };
    window.WUPE.chat.sfm = async function(c, f, o = {}) {
        const w = window.require;
        const C = window.WUPE.chat;
        const W = window.WUPE.wa;
        const chat_ = C.chat_;
        const createUser = C.createUser;
        const gmd = W.gmd;
        const verificaArrayLid = window.WUPE.loader.verificaArrayLid;
        const getMsg = C.getMsg;
        const convertToFile = window.WUPE.loader.convertToFile;
        const fetchTrans = window.WUPE.loader.fetchTrans;
        let verifica_chat = await WUPE.chat.DCCAV(c);
        let ch = null;
        if (c.includes('@g.us')){
             ch = C.chat_().get(c);
        } else if (verifica_chat?.success) {
            c = verifica_chat.finalChatId;
            ch = C.chat_().get(c);
            if (!ch) {
                return {
                    error: 'Chat não encontrado'
                };
            }
        } else {
            return {
                error: verifica_chat?.error
            };
        }
        const file = await convertToFile(f, o.mimetype, o.filename);
        const createFromData = w("WAWebMediaOpaqueData").createFromData;
        const mediaData = await createFromData(file, file.type);
        const prepOptions = {
            isPtt: o.isPtt,
            asDocument: o.asDocument,
            asGif: o.asGif,
            isAudio: o.type === 'audio',
            asSticker: o.asSticker,
            precomputedFields: {
                duration: null,
                waveform: null
            }
        };
        if (o.type === 'audio' && o.isPtt) {
            try {
                const ab = await file.arrayBuffer();
                const ac = new AudioContext();
                const decoded = await ac.decodeAudioData(ab);
                const channelData = decoded.getChannelData(0);
                const samples = 64;
                const blockSize = Math.floor(channelData.length / samples);
                const amplitudes = [];
                for (let i = 0; i < samples; i++) {
                    const start = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(channelData[start + j]);
                    }
                    amplitudes.push(sum / blockSize);
                }
                const max = Math.max(...amplitudes);
                const normalized = amplitudes.map(a => a / max);
                const waveform = new Uint8Array(normalized.map(n => Math.floor(100 * n)));
                prepOptions.precomputedFields = {
                    duration: Math.floor(decoded.duration),
                    waveform: waveform
                };
            } catch (e) {}
        } else if (o.type === 'document') {
            prepOptions.asDocument = true;
        } else if (o.type === 'sticker') {
            prepOptions.asSticker = true;
        } else if (o.type === 'video' && o.isGif) {
            prepOptions.asGif = true;
        }
        const preparedMedia = w("WAWebMedia").prepRawMedia(mediaData, prepOptions);
        let extra = {};
        if (o.markIsRead) {
            await w("WAWebUpdateUnreadChatAction").sendSeen(ch, false);
        }
        await preparedMedia.waitForPrep();
        if (o.wulp) {
            const lp = await w("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(o.wulp);
            extra.ctwaContext = {
                description: lp.data.description,
                title: lp.data.title,
                sourceUrl: lp.data.canonicalUrl,
                thumbnailUrl: "data:image/jpeg;base64," + lp.data.thumbnail,
                renderLargerThumbnail: true,
                mediaType: 1,
                thumbnail: lp.data.thumbnail
            };
        }
        if (ch.isGroup && o.tagall) {
            const g = gmd(ch.id);
            const participants = g.participants.map(e => e.id);
            const r = await verificaArrayLid(participants);
            extra.mentionedJidList = r.result;
        }
        if (o.buttons) {
            extra.nativeFlowName = "quick_reply";
            extra.interactiveHeader = {
                title: o.title || ' ',
                subtitle: o.subtitle || ' ',
                mediaType: o.type.toUpperCase(),
                thumbnail: undefined
            };
            extra.interactivePayload = {
                messageVersion: 1,
                $$unknownFieldCount: 0,
                buttons: o.buttons.map((bt, i) => bt.startsWith("http://") || bt.startsWith("https://") ? {
                    $$unknownFieldCount: 0,
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: bt.split("|")[1] || "Acesse já!",
                        url: bt.split("|")[0] || bt,
                        merchant_url: bt.split("|")[0] || bt
                    })
                } : {
                    $$unknownFieldCount: 0,
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: bt,
                        id: 'MYID' + i
                    })
                })
            };
            extra.interactiveType = "native_flow";
            extra.kind = "interactive";
            extra.type = "interactive";
            extra.caption = o.caption;
        }
        if (o.quotedMsg) {
            extra.quotedMsg = await getMsg(o.quotedMsg);
        }
        if (c === 'status@broadcast') {
            return {
                result: await w("WAWebWhatsUpPlusStatusMedia").sendMediaMsgToChat(preparedMedia, ch, {
                    addEvenWhilePreparing: false,
                    caption: o.caption,
                    type: o.type,
                    backgroundColor: o.backgroundColor || null
                })
            };
        }
        if ((o.type === 'image' || o.type === 'video') && o.caption && o.caption !== '') {
            let contatos = localStorage.getItem('contatos_traduzir');
            let contatosTraduzir = JSON.parse(contatos || '[{"error":"error"}]');
            let contato = contatosTraduzir.filter(f => f.id == ch.id._serialized);
            let meu_nome = localStorage.getItem('meu_nome') ? '*' + localStorage.getItem('meu_nome') + ':*\n\n' : '';
            if (contato[0]) {
                let trans = {
                    text: o.caption,
                    target: contato[0].target
                };
                let traducao = await fetchTrans(trans);
                o.caption = meu_nome !== '' ? meu_nome + traducao.result : traducao.result;
            } else if (meu_nome !== '') {
                o.caption = meu_nome + o.caption;
            }
        }
        const result = await w("WAWebMediaPrep").sendMediaMsgToChat(preparedMedia, ch, {
            addEvenWhilePreparing: false,
            caption: o.caption,
            type: o.buttons ? 'interactive' : o.type,
            ...extra
        });
        if (o.waitForAck) await result;
        return {
            sendMsgResult: result
        };
    };
    window.WUPE.__premiumLoaded = true;
    console.log('[WUP] Premium functions loaded');
    console.log('[WUP] stm:', typeof window.WUPE.chat.stm);
    console.log('[WUP] sfm:', typeof window.WUPE.chat.sfm);
    console.log('[WUP] Para ativar logs de debug: window.WUPE.DEBUG_LOGS = true');
    console.log('[WUP] Para desativar logs: window.WUPE.DEBUG_LOGS = false');
    
    })()
