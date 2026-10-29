const consumCount = (content)=>{
    if(window?.ferdi?.hasRight()){
      return window.traneasy.consumeCount({
        wordCount: content?.length,
        type: 'groupSend-extension'
      })
    }else {
      throw Error('no right')
    }
  };

(() => {
    
     function delay(ms= 0.5) {
        return new Promise(resolve => {
            setTimeout(resolve, ms * 1000);
        });
    }
    var e, t, n, o, s = {
            7: e => {
                "use strict";
                var t, n = "object" == typeof Reflect ? Reflect : null,
                    o = n && "function" == typeof n.apply ? n.apply : function(e, t, n) {
                        return Function.prototype.apply.call(e, t, n)
                    };
                t = n && "function" == typeof n.ownKeys ? n.ownKeys : Object.getOwnPropertySymbols ? function(e) {
                    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
                } : function(e) {
                    return Object.getOwnPropertyNames(e)
                };
                var s = Number.isNaN || function(e) {
                    return e != e
                };

                function a() {
                    a.init.call(this)
                }
                e.exports = a, e.exports.once = function(e, t) {
                    return new Promise((function(n, o) {
                        function s(n) {
                            e.removeListener(t, a), o(n)
                        }

                        function a() {
                            "function" == typeof e.removeListener && e.removeListener("error", s), n([].slice.call(arguments))
                        }
                        m(e, t, a, {
                            once: !0
                        }), "error" !== t && function(e, t, n) {
                            "function" == typeof e.on && m(e, "error", t, {
                                once: !0
                            })
                        }(e, s)
                    }))
                }, a.EventEmitter = a, a.prototype._events = void 0, a.prototype._eventsCount = 0, a.prototype._maxListeners = void 0;
                var r = 10;

                function i(e) {
                    if ("function" != typeof e) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e)
                }

                function c(e) {
                    return void 0 === e._maxListeners ? a.defaultMaxListeners : e._maxListeners
                }

                function l(e, t, n, o) {
                    var s, a, r, l;
                    if (i(n), void 0 === (a = e._events) ? (a = e._events = Object.create(null), e._eventsCount = 0) : (void 0 !== a.newListener && (e.emit("newListener", t, n.listener ? n.listener : n), a = e._events), r = a[t]), void 0 === r) r = a[t] = n, ++e._eventsCount;
                    else if ("function" == typeof r ? r = a[t] = o ? [n, r] : [r, n] : o ? r.unshift(n) : r.push(n), (s = c(e)) > 0 && r.length > s && !r.warned) {
                        r.warned = !0;
                        var d = new Error("Possible EventEmitter memory leak detected. " + r.length + " " + String(t) + " listeners added. Use emitter.setMaxListeners() to increase limit");
                        d.name = "MaxListenersExceededWarning", d.emitter = e, d.type = t, d.count = r.length, l = d, console && console.warn && console.warn(l)
                    }
                    return e
                }

                function d() {
                    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
                }

                function u(e, t, n) {
                    var o = {
                            fired: !1,
                            wrapFn: void 0,
                            target: e,
                            type: t,
                            listener: n
                        },
                        s = d.bind(o);
                    return s.listener = n, o.wrapFn = s, s
                }

                function p(e, t, n) {
                    var o = e._events;
                    if (void 0 === o) return [];
                    var s = o[t];
                    return void 0 === s ? [] : "function" == typeof s ? n ? [s.listener || s] : [s] : n ? function(e) {
                        for (var t = new Array(e.length), n = 0; n < t.length; ++n) t[n] = e[n].listener || e[n];
                        return t
                    }(s) : h(s, s.length)
                }

                function g(e) {
                    var t = this._events;
                    if (void 0 !== t) {
                        var n = t[e];
                        if ("function" == typeof n) return 1;
                        if (void 0 !== n) return n.length
                    }
                    return 0
                }

                function h(e, t) {
                    for (var n = new Array(t), o = 0; o < t; ++o) n[o] = e[o];
                    return n
                }

                function m(e, t, n, o) {
                    if ("function" == typeof e.on) o.once ? e.once(t, n) : e.on(t, n);
                    else {
                        if ("function" != typeof e.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e);
                        e.addEventListener(t, (function s(a) {
                            o.once && e.removeEventListener(t, s), n(a)
                        }))
                    }
                }
                Object.defineProperty(a, "defaultMaxListeners", {
                    enumerable: !0,
                    get: function() {
                        return r
                    },
                    set: function(e) {
                        if ("number" != typeof e || e < 0 || s(e)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e + ".");
                        r = e
                    }
                }), a.init = function() {
                    void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
                }, a.prototype.setMaxListeners = function(e) {
                    if ("number" != typeof e || e < 0 || s(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
                    return this._maxListeners = e, this
                }, a.prototype.getMaxListeners = function() {
                    return c(this)
                }, a.prototype.emit = function(e) {
                    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
                    var s = "error" === e,
                        a = this._events;
                    if (void 0 !== a) s = s && void 0 === a.error;
                    else if (!s) return !1;
                    if (s) {
                        var r;
                        if (t.length > 0 && (r = t[0]), r instanceof Error) throw r;
                        var i = new Error("Unhandled error." + (r ? " (" + r.message + ")" : ""));
                        throw i.context = r, i
                    }
                    var c = a[e];
                    if (void 0 === c) return !1;
                    if ("function" == typeof c) o(c, this, t);
                    else {
                        var l = c.length,
                            d = h(c, l);
                        for (n = 0; n < l; ++n) o(d[n], this, t)
                    }
                    return !0
                }, a.prototype.addListener = function(e, t) {
                    return l(this, e, t, !1)
                }, a.prototype.on = a.prototype.addListener, a.prototype.prependListener = function(e, t) {
                    return l(this, e, t, !0)
                }, a.prototype.once = function(e, t) {
                    return i(t), this.on(e, u(this, e, t)), this
                }, a.prototype.prependOnceListener = function(e, t) {
                    return i(t), this.prependListener(e, u(this, e, t)), this
                }, a.prototype.removeListener = function(e, t) {
                    var n, o, s, a, r;
                    if (i(t), void 0 === (o = this._events)) return this;
                    if (void 0 === (n = o[e])) return this;
                    if (n === t || n.listener === t) 0 == --this._eventsCount ? this._events = Object.create(null) : (delete o[e], o.removeListener && this.emit("removeListener", e, n.listener || t));
                    else if ("function" != typeof n) {
                        for (s = -1, a = n.length - 1; a >= 0; a--)
                            if (n[a] === t || n[a].listener === t) {
                                r = n[a].listener, s = a;
                                break
                            } if (s < 0) return this;
                        0 === s ? n.shift() : function(e, t) {
                            for (; t + 1 < e.length; t++) e[t] = e[t + 1];
                            e.pop()
                        }(n, s), 1 === n.length && (o[e] = n[0]), void 0 !== o.removeListener && this.emit("removeListener", e, r || t)
                    }
                    return this
                }, a.prototype.off = a.prototype.removeListener, a.prototype.removeAllListeners = function(e) {
                    var t, n, o;
                    if (void 0 === (n = this._events)) return this;
                    if (void 0 === n.removeListener) return 0 === arguments.length ? (this._events = Object.create(null), this._eventsCount = 0) : void 0 !== n[e] && (0 == --this._eventsCount ? this._events = Object.create(null) : delete n[e]), this;
                    if (0 === arguments.length) {
                        var s, a = Object.keys(n);
                        for (o = 0; o < a.length; ++o) "removeListener" !== (s = a[o]) && this.removeAllListeners(s);
                        return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
                    }
                    if ("function" == typeof(t = n[e])) this.removeListener(e, t);
                    else if (void 0 !== t)
                        for (o = t.length - 1; o >= 0; o--) this.removeListener(e, t[o]);
                    return this
                }, a.prototype.listeners = function(e) {
                    return p(this, e, !0)
                }, a.prototype.rawListeners = function(e) {
                    return p(this, e, !1)
                }, a.listenerCount = function(e, t) {
                    return "function" == typeof e.listenerCount ? e.listenerCount(t) : g.call(e, t)
                }, a.prototype.listenerCount = g, a.prototype.eventNames = function() {
                    return this._eventsCount > 0 ? t(this._events) : []
                }
            },
            759: (e, t, n) => {
                "use strict";
                const o = n(276);
                e.exports = e => {
                    if (!o(e)) return !1;
                    const t = e.trim().match(o.regex),
                        n = {};
                    if (t[1]) {
                        n.mediaType = t[1].toLowerCase();
                        const e = t[1].split(";").map((e => e.toLowerCase()));
                        n.contentType = e[0], e.slice(1).forEach((e => {
                            const t = e.split("=");
                            n[t[0]] = t[1]
                        }))
                    }
                    return n.base64 = !!t[t.length - 2], n.data = t[t.length - 1] || "", n.toBuffer = () => {
                        const e = n.base64 ? "base64" : "utf8";
                        return Buffer.from(n.base64 ? n.data : decodeURIComponent(n.data), e)
                    }, n
                }
            },
            276: function(e, t) {
                var n, o;
                void 0 === (o = "function" == typeof(n = function() {
                    "use strict";

                    function e(t) {
                        return e.regex.test((t || "").trim())
                    }
                    return e.regex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i, e
                }) ? n.apply(t, []) : n) || (e.exports = o)
            },
            812: (e, t, n) => {
                "use strict";
                n.d(t, {
                    Y: () => i,
                    k: () => r
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebWidFactory"),
                    a = (0, o.WhatsUpLoad)("WAWebGetProfilePicJob");

                function r(e) {
                    return s.createUserWidOrThrow(e)
                }

                function i(e, t) {
                    return a.getProfilePic(e, t)
                }
            },
            974: (e, t, n) => {
                "use strict";
                n.d(t, {
                    q: () => a
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebMsgCollection")?.MsgCollection;

                function a(e) {
                    return s.get(e)
                }
            },
            103: (e, t, n) => {
                "use strict";
                var o = n(658);
                (0, o.WhatsUpLoad)("useWAWebLinkPreview"), (0, o.WhatsUpLoad)("WAWebLinkPreviewChatAction");
                const s = (0, o.WhatsUpLoad)("WAWebMediaUploadMmsThumbnail"),
                    a = (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction"),
                    r = a.genMinimalLinkPreview;
                a.genMinimalLinkPreview2 = a.genMinimalLinkPreview;
                const i = a.genMinimalLinkPreview2,
                    c = (0, o.WhatsUpLoad)("WAWebMediaOpaqueData"),
                    l = (0, o.WhatsUpLoad)("WABase64"),
                    d = (0, o.WhatsUpLoad)("WATimeUtils"),
                    u = 200;
                var p = [];
                async function g(e) {
                    const t = new TextDecoder,
                        n = "https://wup.plus/prev.png?get=" + btoa(unescape(encodeURIComponent(e))).replace("/", "_"),
                        s = await (0, o.fdp)(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e))),
                        a = /^video/.test(s.mediaType);
                    return {
                        title: s.title,
                        description: s.description,
                        canonicalUrl: s.url,
                        matchedText: e,
                        richPreviewType: a ? 1 : 0,
                        doNotPlayInline: !a,
                        imageUrl: s.image
                    }
                }
                async function h(e) {
                    try {
                        const t = await (0, o.downloadImage)(e).catch((e => console.log(e)));
                        if (!t) return null;
                        const n = await
                        function(e) {
                            return new Promise(((t, n) => {
                                const o = new Image;
                                o.crossOrigin = "anonymous", o.src = e, o.onerror = n, o.onload = () => {
                                    try {
                                        const e = document.createElement("canvas"),
                                            n = e.getContext("2d");
                                        e.width = u, e.height = u;
                                        const s = Math.min(o.width, o.height),
                                            a = (o.width - s) / 2,
                                            r = (o.height - s) / 2;
                                        n.drawImage(o, a, r, s, s, 0, 0, u, u), t(e.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, ""))
                                    } catch (e) {
                                        n()
                                    }
                                }
                            }))
                        }(t.data), a = t.data.replace("data:image/jpeg;base64,", ""), r = await c.createFromBase64Jpeg(a), i = new Uint8Array(32), p = (window.crypto.getRandomValues(i), {
                            key: l.encodeB64(i),
                            timestamp: d.unixTime()
                        }), g = new AbortController, h = await s({
                            thumbnail: r,
                            mediaType: "thumbnail-link",
                            mediaKeyInfo: p,
                            uploadOrigin: 1,
                            forwardedFromWeb: !1,
                            signal: g.signal,
                            timeout: 3e3,
                            isViewOnce: !1
                        }), m = h.mediaEntry;
                        return {
                            thumbnail: n,
                            thumbnailHQ: a,
                            mediaKey: m.mediaKey,
                            mediaKeyTimestamp: m.mediaKeyTimestamp,
                            thumbnailDirectPath: m.directPath,
                            thumbnailSha256: h.filehash,
                            thumbnailEncSha256: m.encFilehash,
                            thumbnailWidth: t.width,
                            thumbnailHeight: t.height
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
                a.genMinimalLinkPreview2 = (0, o.wrapf)(i, ((e, ...t) => {
                    const [n] = t, s = "string" == typeof n ? (0, o.WhatsUpLoad)("useWAWebLinkPreview").findFirstWebLink(n).url : n.url, a = p.find((e => e.url == s));
                    return new Promise((async n => {
                        try {
                            if (a) n(a);
                            else {
                                const e = await g(s);
                                if (!e) throw new Error(`preview not found for ${s}`);
                                const {
                                    imageUrl: t,
                                    ...o
                                } = e;
                                let a = {};
                                t && (a = await h(t).catch((e => {
                                    console.log(e)
                                })));
                                const r = {
                                    url: s,
                                    data: {
                                        ...o,
                                        ...a
                                    }
                                };
                                p.push(r), n(r)
                            }
                        } catch (o) {
                            console.log(o), n(e(...t))
                        }
                    }))
                })), a.genMinimalLinkPreview = (0, o.wrapf)(r, ((e, ...t) => {
                    const [n] = t, s = "string" == typeof n ? (0, o.WhatsUpLoad)("useWAWebLinkPreview").findFirstWebLink(n).url : n.url, a = p.find((e => e.url == s));
                    return new Promise((async n => {
                        try {
                            if ("true" == localStorage.getItem("linkpreviwhqenabled"))
                                if (a) n(a);
                                else {
                                    const e = await g(s);
                                    if (!e) throw new Error(`preview not found for ${s}`);
                                    const {
                                        imageUrl: t,
                                        ...o
                                    } = e;
                                    let a = {};
                                    t && (a = await h(t).catch((e => {
                                        console.log(e)
                                    })));
                                    const r = {
                                        url: s,
                                        data: {
                                            ...o,
                                            ...a
                                        }
                                    };
                                    p.push(r), n(r)
                                }
                            else n(e(...t))
                        } catch (o) {
                            console.log(o), n(e(...t))
                        }
                    }))
                }))
            },
            772: (e, t, n) => {
                "use strict";
                n.d(t, {
                    Gw: () => i,
                    Jt: () => a,
                    TE: () => r,
                    w5: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAWebChatCollection");
                window.ssssss=o;
                console.log("658658658658658658",o)
                function s() {
                    return o.ChatCollection._models
                }

                function a(e) {
                    return o.ChatCollection.get(e)
                }

                function r() {
                    return o.ChatCollection 
                }

                function i() {
                    return o.ChatCollection
                }
            },
            191: (e, t, n) => {
                "use strict";
                n.d(t, {
                    O6: () => h,
                    Zo: () => W
                });
                var o = n(658),
                    s = n(509),
                    a = n(974),
                    r = (n(103), n(772)),
                    i = n(812),
                    l = n(242);
                const d = (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser"),
                    u = (0, o.WhatsUpLoad)("WAWebMsgKey"),
                    p = (0, o.WhatsUpLoad)("WAWebWidFactory"),
                    g = (0, o.WhatsUpLoad)("WAWebMsgKeyNewId");
                async function h(e) {
                    const t = d.getMaybeMePnUser();
                    let n, o;
                    return n = e.id, n.isGroup && (o = p.asUserWidOrThrow(t)), new u({
                        from: t,
                        to: n,
                        id: await Promise.resolve(g.getMsgKeyNewSHA256Id()),
                        participant: o,
                        selfDir: "out"
                    })
                }(0, o.WhatsUpLoad)("WAWebGetEphemeralFieldsMsgActionsUtils"), (0, o.WhatsUpLoad)("WATimeUtils"), (0, o.WhatsUpLoad)("useWAWebLinkPreview"), (0, o.WhatsUpLoad)("WAWebLinkPreviewChatAction"), (0, o.WhatsUpLoad)("WAWebLinkPreviewCache"), (0, o.WhatsUpLoad)("WAWebBackendJobsCommon").mediaTypeFromProtobuf;
                const m = (0, o.WhatsUpLoad)("WAWebMediaOpaqueData").createFromData;
                async function W(e, t, n = {}) {
                    let d = e.split("@")[1];
                    if ("lid" == d) {
                        let e = (0, o.WhatsUpLoad)("WAWebApiContact").getPhoneNumber((0, o.WhatsUpLoad)("WAWebWidFactory").createWid(c));
                        e?._serialized && (c = e._serialized, d = c.split("@")[1])
                    }
                    let u = "status@broadcast" === e ? (0, l.Y)() : (0, r.Gw)().get(e);
                    u || "g.us" != d && "c.us" != d ? u || "lid" != d || (await (0, o.WhatsUpLoad)("WAWebCreateChat").createChat({
                        chatId: (0, o.WhatsUpLoad)("WAWebWidFactory").asUserLidOrThrow((0, o.WhatsUpLoad)("WAWebWidFactory").createWid(e)),
                        accountLid: (0, o.WhatsUpLoad)("WAWebWidFactory").createWid(e)
                    }, "debugCreateChat", {
                        lidOriginType: (0, o.WhatsUpLoad)("WAWebUsernameTypes").LidOriginType.GENERAL
                    }), u = (0, r.Gw)().get(e)) : ((0, r.Gw)().add({
                        id: new i.k(e, {
                            intentionallyUsePrivateConstructor: !0
                        })
                    }, {
                        merge: !0,
                        add: !0
                    }), u = (0, r.Gw)().get(e));
                    const p = await (0, o.convertToFile)(t, n.mimetype, n.filename),
                        g = (p.name, await m(p, p.type)),
                        h = {
                            isPtt: n.isPtt,
                            asDocument: n.asDocument,
                            asGif: n.asGif,
                            isAudio: "audio" === n.type,
                            asSticker: n.asSticker,
                            precomputedFields: {
                                duration: null,
                                waveform: null
                            }
                        };
                    let W;
                    "audio" === n.type ? (h.isPtt = n.isPtt, h.precomputedFields = await async function(e, t) {
                        if (e.isPtt) try {
                            const e = await t.arrayBuffer(),
                                n = new AudioContext,
                                o = await n.decodeAudioData(e),
                                s = o.getChannelData(0),
                                a = 64,
                                r = Math.floor(s.length / a),
                                i = [];
                            for (let e = 0; e < a; e++) {
                                const t = r * e;
                                let n = 0;
                                for (let e = 0; e < r; e++) n += Math.abs(s[t + e]);
                                i.push(n / r)
                            }
                            const c = Math.pow(Math.max(...i), -1),
                                l = i.map((e => e * c)),
                                d = new Uint8Array(l.map((e => Math.floor(100 * e))));
                            return {
                                duration: Math.floor(o.duration),
                                waveform: d
                            }
                        } catch (e) {}
                    }(n, p)) : "image" === n.type ? W = n.isViewOnce : "video" === n.type ? h.asGif = n.isGif : "document" === n.type ? h.asDocument = !0 : "sticker" === n.type && (h.asSticker = !0);
                    const f = (0, o.WhatsUpLoad)("WAWebMedia").prepRawMedia(g, h);
                    let b = {};
                    if (n.markIsRead && await (0, o.WhatsUpLoad)("WAWebUpdateUnreadChatAction").sendSeen(u, !1), await f.waitForPrep(), n.wulp) {
                        let e = (await (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp)).data;
                        b.ctwaContext = {
                            description: e.description,
                            title: e.title,
                            sourceUrl: e.canonicalUrl,
                            thumbnailUrl: "data:image/jpeg;base64," + e.thumbnail,
                            renderLargerThumbnail: !0,
                            mediaType: 1,
                            thumbnail: e.thumbnail
                        }
                    }
                    if (u.isGroup && n.tagall) {
                        var y = (0, s.r)(u.id).participants.map((e => e.id));
                        const e = await (0, o.verificaArrayLid)(y);
                        b.mentionedJidList = e.result
                    }
                    if (n.buttons) {
                        b.nativeFlowName = "quick_reply", b.interactiveHeader = {
                            title: n.title ? n.title : " ",
                            subtitle: n.subtitle ? n.subtitle : " ",
                            mediaType: n.type.toUpperCase(),
                            thumbnail: void 0
                        };
                        let e = n.buttons.map(((e, t) => e.startsWith("http://") || e.startsWith("https://") ? {
                            $$unknownFieldCount: 0,
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: e.split("|").length > 1 ? e.split("|")[1] : "Acesse já!",
                                url: e.split("|").length > 1 ? e.split("|")[0] : e,
                                merchant_url: e.split("|").length > 1 ? e.split("|")[0] : e
                            })
                        } : {
                            $$unknownFieldCount: 0,
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: e,
                                id: `MYID${t}`
                            })
                        }));
                        b.interactivePayload = {
                            messageVersion: 1,
                            $$unknownFieldCount: 0,
                            buttons: e
                        }, b.interactiveType = "native_flow", b.kind = "interactive", b.type = "interactive", b.caption = n.caption
                    }
                    if (n.quotedMsg && (b.quotedMsg = await (0, a.q)(n.quotedMsg)), "status@broadcast" == e) return {
                        result: await (0, o.WhatsUpLoad)("WAWebWhatsUpPlusStatusMedia").sendMediaMsgToChat(f, u, {
                            addEvenWhilePreparing: !1,
                            caption: n.caption,
                            type: n.type,
                            backgroundColor: null != n.backgroundColor ? n.backgroundColor : null
                        })
                    }; {
                        if (("image" === n.type || "video" === n.type) && n.caption && "" !== n.caption) {
                            let e = localStorage.getItem("contatos_traduzir"),
                                t = JSON.parse(e || '[{"error":"error"}]').filter((function(e) {
                                    return e.id == u.id._serialized
                                })),
                                s = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "";
                            if (t[0]) {
                                let e = {};
                                e.text = n.caption, e.target = t[0].target;
                                let a = await (0, o.fetchTrans)(e);
                                n.caption = "" !== s ? s + a.result : a.result
                            } else "" !== s && (n.caption = s + n.caption)
                        }
                        const e = await (0, o.WhatsUpLoad)("WAWebMediaPrep").sendMediaMsgToChat(f, u, {
                            addEvenWhilePreparing: !1,
                            caption: n.caption,
                            type: n.buttons ? "interactive" : n.type,
                            ...b
                        });
                        return n.waitForAck && await e, {
                            sendMsgResult: e
                        }
                    }
                }
            },
            251: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    PanelChat: () => he,
                    abrirChat: () => d,
                    archiveChat: () => ie,
                    chat: () => o.TE,
                    chat_: () => o.Gw,
                    createUser: () => i.k,
                    deleteChat: () => le,
                    disableFilter: () => We,
                    disableUnreadChatsOnTop: () => ge,
                    downMedia: () => v,
                    enableUnreadChatsOnTop: () => pe,
                    entraKnal: () => E,
                    enviaPix: () => de,
                    filtraChat: () => me,
                    get: () => o.Jt,
                    getActive: () => r,
                    getChatRealName: () => f,
                    getFilterState: () => fe,
                    getMsg: () => C.q,
                    getName: () => m,
                    getNameStatus: () => h,
                    getProfilePic: () => i.Y,
                    getRealName: () => W,
                    listaTodosChats: () => o.w5,
                    pinChat: () => oe,
                    revokeMsg: () => ae,
                    saf: () => _.Zo,
                    sendCall: () => Q,
                    sendReact: () => Z,
                    shareador: () => I,
                    spm: () => $,
                    state: () => G,
                    stn: () => B,
                    svm: () => x,
                    unMuteKnal: () => S
                });
                var o = n(772),
                    s = n(658);
                const a = (0, s.WhatsUpLoad)("WAWebChatCollection");

                function r() {
                    return a.ChatCollection.getActive()
                }
                var i = n(812);
                const l = (0, s.WhatsUpLoad)("WAWebCmd");

                function d(e) {
                    return l.Cmd.openChatBottom(e)
                }
                var u = n(452);
                const p = (0, s.WhatsUpLoad)("WAWebContactCollection"),
                    g = (0, s.WhatsUpLoad)("WAWebChatCollection");

                function h(e) {
                    let t = p.ContactCollection.get(e);
                    return t ? t.pushname || t.name || t.verifiedName || (0, o.Jt)(e)?.formattedTitle || (0, u.q)(t.id?.user || e) : (0, o.Jt)(e)?.formattedTitle || (0, u.q)(e) || e
                }

                function m(e) {
                    let t = p.ContactCollection.get(e);
                    return t ? t.name || (0, u.q)(t.id.user) : (0, o.Jt)(e)?.formattedTitle || (0, u.q)(e) || e
                }

                function W(e) {
                    let t = p.ContactCollection.get(e);
                    return t ? t.pushname || t.verifiedName || (0, u.q)(t.id.user) : (0, o.Jt)(e)?.formattedTitle || (0, u.q)(e) || e
                }

                function f(e) {
                    let t = g.ChatCollection.get(e);
                    return t ? t.pushname || t.verifiedName || (0, u.q)(t.id.user) : (0, o.Jt)(e)?.formattedTitle || (0, u.q)(e) || e
                }
                const b = (0, s.WhatsUpLoad)("WAWebLoadNewsletterPreviewChatAction")?.loadNewsletterPreviewChat,
                    y = (0, s.WhatsUpLoad)("WAWebMexJoinNewsletterJob")?.mexJoinNewsletter,
                    A = (0, s.WhatsUpLoad)("WAWebNewsletterToggleMuteStateAction")?.unmuteNewsletterAction;

                function E(e, t = !0) {
                    b(e).then((async e => {
                        await y(e.id._serialized), t && A(e.id, {
                            eventSurface: 5
                        })
                    }))
                }

                function S(e) {
                    b(e).then((async e => {
                        A(e.id, {
                            eventSurface: 5
                        })
                    }))
                }
                const w = (0, s.WhatsUpLoad)("WAWebDownloadManager")?.downloadManager;
                async function v(e) {
                    return await w.downloadAndMaybeDecrypt(e)
                }
                var C = n(974),
                    _ = n(191);
                n(349);
                const T = (0, s.WhatsUpLoad)("WAWebFrontendVcardUtils"),
                    M = (0, s.WhatsUpLoad)("WAWebUserPrefsMeUser"),
                    P = ((0, s.WhatsUpLoad)("WAWebMsgKeyNewId"), (0, s.WhatsUpLoad)("WAWebSendMsgChatAction"));
                async function x(e, t) {
                    let n = e.split("@")[1];
                    if ("lid" == n) {
                        let e = (0, s.WhatsUpLoad)("WAWebApiContact").getPhoneNumber((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(c));
                        e?._serialized && (c = e._serialized, n = c.split("@")[1])
                    }
                    let a = (0, o.Gw)().get(e);
                    a || "g.us" != n && "c.us" != n ? a || "lid" != n || (await (0, s.WhatsUpLoad)("WAWebCreateChat").createChat({
                        chatId: (0, s.WhatsUpLoad)("WAWebWidFactory").asUserLidOrThrow((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)),
                        accountLid: (0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)
                    }, "debugCreateChat", {
                        lidOriginType: (0, s.WhatsUpLoad)("WAWebUsernameTypes").LidOriginType.GENERAL
                    }), a = (0, o.Gw)().get(e)) : ((0, o.Gw)().add({
                        id: new i.k(e, {
                            intentionallyUsePrivateConstructor: !0
                        })
                    }, {
                        merge: !0,
                        add: !0
                    }), a = (0, o.Gw)().get(e));
                    var r = await Promise.all(t.map((async e => {
                            let t = (0, o.Gw)().get(e);
                            return t || ((0, o.Gw)().add({
                                id: new i.k(e, {
                                    intentionallyUsePrivateConstructor: !0
                                })
                            }, {
                                merge: !0,
                                add: !0
                            }), t = (0, o.Gw)().get(e)), t
                        }))),
                        l = await Promise.all(r),
                        d = new Array;
                    for (var u in l) "object" == typeof l[u] && d.push(l[u].contact);
                    var p = d.map((async e => {
                            if ("object" == typeof e) return await T.vcardFromContactModel(e)
                        })),
                        g = await Promise.resolve(await (0, _.O6)(a));
                    const h = await M.getMaybeMePnUser();
                    var m = await Promise.all(p);
                    const W = {
                        id: g,
                        ack: 0,
                        from: h,
                        local: !0,
                        self: "in",
                        t: parseInt((new Date).getTime() / 1e3),
                        to: a.id,
                        ...d.length > 1 ? {
                            type: "multi_vcard"
                        } : {
                            type: "vcard"
                        },
                        ...d.length > 1 ? {
                            vcardList: m
                        } : {
                            body: m[0].vcard
                        },
                        isNewMsg: !0
                    };
                    await P.addAndSendMsgToChat(a, W)
                }
                var L = n(509);
                n(103);
                let U = (0, s.WhatsUpLoad)("WAWebSendTextMsgChatAction")?.sendTextMsgToChat,
                    k = (0, s.WhatsUpLoad)("WAWebSendTextMsgChatAction")?.addAndSendTextMsg,
                    D = (0, s.WhatsUpLoad)("WAWebSendTextMsgChatAction")?.createTextMsgData;
                async function I(e, t, n) {
                    if (!t || " " == t) return;
                    let a = e.split("@")[1];
                    if ("lid" == a) {
                        let t = (0, s.WhatsUpLoad)("WAWebApiContact").getPhoneNumber((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e));
                        t?._serialized && (a = (e = t._serialized).split("@")[1])
                    }
                    let r = (0, o.Gw)().get(e);
                    r || "g.us" != a && "c.us" != a ? r || "lid" != a || (await (0, s.WhatsUpLoad)("WAWebCreateChat").createChat({
                        chatId: (0, s.WhatsUpLoad)("WAWebWidFactory").asUserLidOrThrow((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)),
                        accountLid: (0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)
                    }, "debugCreateChat", {
                        lidOriginType: (0, s.WhatsUpLoad)("WAWebUsernameTypes").LidOriginType.GENERAL
                    }), r = (0, o.Gw)().get(e)) : ((0, o.Gw)().add({
                        id: new i.k(e, {
                            intentionallyUsePrivateConstructor: !0
                        })
                    }, {
                        merge: !0,
                        add: !0
                    }), r = (0, o.Gw)().get(e));
                    let c = {};
                    if (!1 === t.includes("http") && !n?.wulp || 0 == n?.lp) {
                        if (r.isGroup && n?.tagall) {
                            var l = (0, L.r)(r.id).participants.map((e => e.id));
                            const e = await (0, s.verificaArrayLid)(l);
                            c.mentionedJidList = e.result
                        } else if (r.isGroup) {
                            const e = t.match(/(?<=@)(\d+)\b/g) || [];
                            let n = [];
                            if (e.length > 0) {
                                const t = (0, L.r)(r.id);
                                for (const o of e) {
                                    const e = `${o}@c.us`,
                                        s = t.participants.filter((t => t.id._serialized == e));
                                    1 == s.length && n.push(s[0].id)
                                }
                            }
                            n.length > 0 && (c.mentionedJidList = n)
                        }
                        if (n?.quotedMsg && (c = {
                                quotedMsg: await (0, C.q)(n?.quotedMsg)
                            }), n?.buttons) {
                            let e = await D(r, t, c);
                            e.nativeFlowName = "quick_reply", e.interactiveHeader = {
                                title: " ",
                                subtitle: " ",
                                hasMediaAttachment: !1
                            }, e.interactiveHeader = {
                                title: n.title ? n.title : " ",
                                subtitle: n.subtitle ? n.subtitle : " ",
                                hasMediaAttachment: !1
                            };
                            let o = n.buttons.map(((e, t) => e.startsWith("http://") || e.startsWith("https://") ? {
                                $$unknownFieldCount: 0,
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({
                                    display_text: e.split("|").length > 1 ? e.split("|")[1] : "Acesse já!",
                                    url: e.split("|").length > 1 ? e.split("|")[0] : e,
                                    merchant_url: e.split("|").length > 1 ? e.split("|")[0] : e
                                })
                            } : {
                                $$unknownFieldCount: 0,
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: e,
                                    id: `MYID${t}`
                                })
                            }));
                            return e.interactivePayload = {
                                messageVersion: 1,
                                $$unknownFieldCount: 0,
                                buttons: o
                            }, e.interactiveType = "native_flow", e.kind = "interactive", e.type = "interactive", e.caption = t, await k(r, e)
                        }
                        return await U(r, t, c)
                    }
                    if (r.isGroup && n?.tagall) {
                        l = (0, L.r)(r.id).participants.map((e => e.id));
                        const e = await (0, s.verificaArrayLid)(l);
                        c.mentionedJidList = e.result
                    } else if (r.isGroup) {
                        const e = t.match(/(?<=@)(\d+)\b/g) || [];
                        let n = [];
                        if (e.length > 0) {
                            const t = (0, L.r)(r.id);
                            for (const o of e) {
                                const e = `${o}@c.us`,
                                    s = t.participants.filter((t => t.id._serialized == e));
                                1 == s.length && n.push(s[0].id)
                            }
                        }
                        n.length > 0 && (c.mentionedJidList = n)
                    }
                    if (n?.quotedMsg) {
                        let e = await (0, C.q)(n?.quotedMsg);
                        c = {
                            ...c,
                            quotedMsg: e
                        }
                    }
                    if (n?.lp || !n?.lp && !n?.wulp) {
                        let e = await (0, s.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t);
                        e && (c.linkPreview = e.data)
                    } else if (n?.wulp) {
                        let e = await (0, s.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp);
                        c.ctwaContext = {
                            description: e.data.description,
                            title: e.data.title,
                            sourceUrl: e.data.canonicalUrl,
                            thumbnailUrl: "data:image/jpeg;base64," + e.data.thumbnail,
                            renderLargerThumbnail: !0,
                            mediaType: 1,
                            thumbnail: e.data.thumbnail
                        }
                    }
                    if (n?.buttons) {
                        let e = await D(r, t, c);
                        e.nativeFlowName = "quick_reply", e.interactiveHeader = {
                            title: n.title ? n.title : " ",
                            subtitle: n.subtitle ? n.subtitle : " ",
                            hasMediaAttachment: !1
                        };
                        let o = n.buttons.map(((e, t) => e.startsWith("http://") || e.startsWith("https://") ? {
                            $$unknownFieldCount: 0,
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: e.split("|").length > 1 ? e.split("|")[1] : "Acesse já!",
                                url: e.split("|").length > 1 ? e.split("|")[0] : e,
                                merchant_url: e.split("|").length > 1 ? e.split("|")[0] : e
                            })
                        } : {
                            $$unknownFieldCount: 0,
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: e,
                                id: `MYID${t}`
                            })
                        }));
                        return e.interactivePayload = {
                            messageVersion: 1,
                            $$unknownFieldCount: 0,
                            buttons: o
                        }, e.interactiveType = "native_flow", e.kind = "interactive", e.type = "interactive", e.caption = t, await k(r, e)
                    }
                    return await U(r, t, c)
                }(0, s.WhatsUpLoad)("useWAWebLinkPreview"), (0, s.WhatsUpLoad)("WAWebLinkPreviewChatAction"), (0, s.WhatsUpLoad)("WAWebLinkPreviewCache");
                let R = (0, s.WhatsUpLoad)("WAWebNewsletterSendMsgAction")?.sendNewsletterTextMsg,
                    O = (0, s.WhatsUpLoad)("WAWebLoadNewsletterPreviewChatAction").loadNewsletterPreviewChat;
                async function B(e, t, n) {
                    let o = await O(e),
                        a = {};
                    if (n?.lp) {
                        let e = await (0, s.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t);
                        e && (a.linkPreview = e.data)
                    } else if (n?.wulp) {
                        let e = await (0, s.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp);
                        a.ctwaContext = {
                            description: e.data.description,
                            title: e.data.title,
                            sourceUrl: e.data.canonicalUrl,
                            thumbnailUrl: "data:image/jpeg;base64," + e.data.thumbnail,
                            renderLargerThumbnail: !0,
                            mediaType: 1,
                            thumbnail: e.data.thumbnail
                        }
                    }
                    return await R(o, t, a)
                }
                let N = (0, s.WhatsUpLoad)("WAWebChatStateBridge");
                async function G(e, t) {
                    switch (e) {
                        case 0:
                            await N.sendChatStateComposing(t);
                            break;
                        case 1:
                            await N.sendChatStateRecording(t);
                            break;
                        case 2:
                            await N.sendChatStatePaused(t);
                            break;
                        default:
                            return !1
                    }
                    return !0
                }
                const H = (0, s.WhatsUpLoad)("WAWebSendMsgChatAction"),
                    F = (0, s.WhatsUpLoad)("WAWebPollsActionsMetricUtils")?.commitPollsActionsMetric,
                    z = (0, s.WhatsUpLoad)("WAWebPollsSendPollCreationMsgAction")?.createPollCreationMsgData;
                async function $(e, t, n, a = !1) {
                    let r = [];
                    n.map((e => r.push({
                        name: e
                    })));
                    let l = (0, o.Gw)().get(e),
                        d = e.split("@")[1];
                    if ("lid" == d) {
                        let e = (0, s.WhatsUpLoad)("WAWebApiContact").getPhoneNumber((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(c));
                        e?._serialized && (c = e._serialized, d = c.split("@")[1])
                    }
                    l || "g.us" != d && "c.us" != d ? l || "lid" != d || (await (0, s.WhatsUpLoad)("WAWebCreateChat").createChat({
                        chatId: (0, s.WhatsUpLoad)("WAWebWidFactory").asUserLidOrThrow((0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)),
                        accountLid: (0, s.WhatsUpLoad)("WAWebWidFactory").createWid(e)
                    }, "debugCreateChat", {
                        lidOriginType: (0, s.WhatsUpLoad)("WAWebUsernameTypes").LidOriginType.GENERAL
                    }), l = (0, o.Gw)().get(e)) : ((0, o.Gw)().add({
                        id: new i.k(e, {
                            intentionallyUsePrivateConstructor: !0
                        })
                    }, {
                        merge: !0,
                        add: !0
                    }), l = (0, o.Gw)().get(e));
                    let u = await z({
                        poll: {
                            name: t,
                            options: r,
                            selectableOptionsCount: 1
                        },
                        chat: l
                    });
                    if (l.isGroup && a) {
                        var p = (await (0, L.r)(e)).participants.map((e => e.id));
                        const t = await (0, s.verificaArrayLid)(p);
                        u.mentionedJidList = t.result
                    }
                    const [g] = await Promise.all(H.addAndSendMsgToChat(l, u));
                    F({
                        action: 2,
                        chat: l,
                        creationDateInSeconds: g.t,
                        pollOptionsCount: r.length
                    })
                }
                var K = n(707);
                const J = (0, s.WhatsUpLoad)("WAWebCallCollection"),
                    q = (0, s.WhatsUpLoad)("WAWebDBDeviceListFanout")?.getFanOutList,
                    V = (0, s.WhatsUpLoad)("WAWebEncryptMsgProtobuf")?.encryptMsgProtobuf,
                    j = (0, s.WhatsUpLoad)("WAWebUserPrefsMeUser")?.assertGetMe;
                async function Y(e) {
                    const t = ["ACTIVE", "OUTGOING_CALLING", "OUTGOING_RING"];
                    let n;
                    n = e ? J.get(e) : J.findFirst((e => t.includes(e.getState()) || e.isGroup)), n.peerJid.isGroupCall() || await (0, s.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions([n.peerJid]);
                    const o = (0, s.WhatsUpLoad)("WASmaxJsx").smax("call", {
                        to: n.peerJid.toString({
                            legacy: !0
                        }),
                        id: (0, s.WhatsUpLoad)("WAWap").generateId()
                    }, [(0, s.WhatsUpLoad)("WASmaxJsx").smax("terminate", {
                        "call-id": n.id,
                        "call-creator": n.peerJid.toString({
                            legacy: !0
                        })
                    }, null)]);
                    return await (0, s.WhatsUpLoad)("WAComms").sendSmaxStanza(o), !0
                }
                async function Q(e, t) {
                    t = Object.assign({
                        isVideo: !1
                    }, t);
                    const n = (0, K.Pq)(e),
                        o = (0, s.WhatsUpLoad)("WARandomHex").randomHex(16).substr(0, 64),
                        a = j(),
                        r = [(0, s.WhatsUpLoad)("WASmaxJsx").smax("audio", {
                            enc: "opus",
                            rate: "16000"
                        }, null), (0, s.WhatsUpLoad)("WASmaxJsx").smax("audio", {
                            enc: "opus",
                            rate: "8000"
                        }, null)];
                    t.isVideo && r.push((0, s.WhatsUpLoad)("WASmaxJsx").smax("video", {
                        orientation: "0",
                        screen_width: "1920",
                        screen_height: "1080",
                        device_orientation: "0",
                        enc: "vp8",
                        dec: "vp8"
                    }, null)), r.push((0, s.WhatsUpLoad)("WASmaxJsx").smax("net", {
                        medium: "3"
                    }, null), (0, s.WhatsUpLoad)("WASmaxJsx").smax("capability", {
                        ver: "1"
                    }, new Uint8Array([1, 4, 255, 131, 207, 4])), (0, s.WhatsUpLoad)("WASmaxJsx").smax("encopt", {
                        keygen: "2"
                    }, null));
                    const i = self.crypto.getRandomValues(new Uint8Array(32)).buffer;
                    r.push(...await async function(e, t) {
                        const n = await q({
                            wids: e
                        });
                        await (0, s.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions(n);
                        let o = !1;
                        const a = await Promise.all(n.map((async e => {
                                const {
                                    type: n,
                                    ciphertext: a
                                } = await V(e, 0, {
                                    call: {
                                        callKey: new Uint8Array(t)
                                    }
                                });
                                return o = o || "pkmsg" === n, (0, s.WhatsUpLoad)("WASmaxJsx").smax("to", {
                                    jid: e.toString({
                                        legacy: !0
                                    })
                                }, [(0, s.WhatsUpLoad)("WASmaxJsx").smax("enc", {
                                    v: "2",
                                    type: n,
                                    count: "0"
                                }, a)])
                            }))),
                            r = [];
                        if (r.push((0, s.WhatsUpLoad)("WASmaxJsx").smax("destination", {}, a)), o) {
                            const e = await (0, s.WhatsUpLoad)("WAWebAdvSignatureApi").getADVEncodedIdentity();
                            r.push((0, s.WhatsUpLoad)("WASmaxJsx").smax("device-identity", void 0, e))
                        }
                        return r
                    }([n], i));
                    const c = (0, s.WhatsUpLoad)("WASmaxJsx").smax("call", {
                            to: n.toString({
                                legacy: !0
                            }),
                            id: (0, s.WhatsUpLoad)("WARandomHex").randomHex(8)
                        }, [(0, s.WhatsUpLoad)("WASmaxJsx").smax("offer", {
                            "call-id": o,
                            "call-creator": a.toString({
                                legacy: !0
                            })
                        }, r)]),
                        l = new((0, s.WhatsUpLoad)("WAWebCallModel"))({
                            id: o,
                            peerJid: n,
                            isVideo: t.isVideo,
                            isGroup: !1,
                            outgoing: !0,
                            offerTime: (0, s.WhatsUpLoad)("WATimeUtils").unixTime(),
                            webClientShouldHandle: !1,
                            canHandleLocally: !0
                        });
                    return J.add(l), J.setActiveCall(J.assertGet(o)), l.setState("OUTGOING_CALLING"), await (0, s.WhatsUpLoad)("WAComms").sendSmaxStanza(c), console.log("<!> enviando call", e, o), setTimeout((() => {
                        const t = (0, s.WhatsUpLoad)("WAWebCallCollection");
                        Y(o), t.activeCall = null, console.log("<!> call finalizada", e, o)
                    }), t.timeout ? t.timeout : 7e3), l
                }
                const X = (0, s.WhatsUpLoad)("WAWebSendReactionMsgAction");

                function Z(e, t) {
                    return X.sendReactionToMsg(e, t)
                }
                var ee = n(563);
                const te = (0, s.WhatsUpLoad)("WAWebCmd"),
                    ne = te.Cmd.pinChat;
                async function oe(e, t) {
                    return te.Cmd.pinChat(e, t)
                }
                te.Cmd.pinChat = (0, s.wrapf)(ne, (async (e, ...t) => {
                    const [n, o] = t;
                    return ee.A.trackEvent("conversation_pinned", {
                        contactId: n.id._serialized
                    }), await e(...t)
                }));
                const se = (0, s.WhatsUpLoad)("WAWebCmd");
                async function ae(e, t) {
                    return se.Cmd.sendRevokeMsgs(e, {
                        list: t,
                        type: "message"
                    }, {
                        clearMedia: !0,
                        toastPosition: void 0
                    })
                }
                const re = (0, s.WhatsUpLoad)("WAWebCmd");
                async function ie(e, t) {
                    return re.Cmd.archiveChat(e, t)
                }
                const ce = (0, s.WhatsUpLoad)("WAWebDeleteChatAction");

                function le(e) {
                    return ce.sendDelete(e)
                }

                function de(e, t, n, a) {
                    (0, s.WhatsUpLoad)("WAWebUserPrefsCustomPaymentMethods").getPIX = function() {
                        return {
                            display_name: t,
                            key: n,
                            key_type: a
                        }
                    };
                    var r = (0, o.Gw)().get(e);
                    (0, s.WhatsUpLoad)("WAWebBizSendOrderAction").sendPixKeyPaymentInfoMessage(r)
                }
                const ue = function() {
                    const e = [..."side"].join("") && (t = document.getElementById([..."side"].join(""))[Object.keys(t = document.getElementById([..."side"].join(""))).find((e => e.startsWith("__react")))]) ? ((e, t = "stateNode") => {
                        for (; e;) {
                            if (e[t] && e[t].constructor && (e[t].$4 || e[t].fullTextSearch)) return e[t];
                            e = e.return
                        }
                    })(t) : 0;
                    var t;
                    if (!e) return null;
                    let n = null,
                        o = !1,
                        a = !1;
                    const r = e.setState;
                    return e.setState = function(e, t) {
                        return (o || a) && n && e.chats ? r.call(this, {
                            ...e,
                            chats: n
                        }, t) : r.call(this, e, t)
                    }, e.getChatsWithUnreadOnTop_old = function() {
                        return this.$31(void 0, {}).sort(((e, t) => e.unreadCount > 0 && t.unreadCount > 0 ? !e.isGroup && t.isGroup ? -1 : e.isGroup && !t.isGroup ? 1 : 0 : t.unreadCount > 0 && 0 === e.unreadCount ? 1 : 0 === t.unreadCount && e.unreadCount > 0 ? -1 : 0))
                    }, e.getChatsWithUnreadOnTop = function() {
                        return this.$31(void 0, {}).filter((e => !e.isGroup)).sort(((e, t) => t.unreadCount > 0 && 0 === e.unreadCount ? 1 : 0 === t.unreadCount && e.unreadCount > 0 ? -1 : 0))
                    }, e.setUnreadOnTop = function(e) {
                        a = e
                    }, e.isUnreadOnTopEnabled = function() {
                        return a
                    }, e.filtraChat = function(e = null) {
                        if (e) o = !0, n = e, r.call(this, {
                            chats: n
                        });
                        else if (a) {
                            const e = this.getChatsWithUnreadOnTop();
                            o = !1, n = e, r.call(this, {
                                chats: e
                            })
                        } else {
                            o = !1, n = null;
                            let e = this.$31(void 0, {});
                            r.call(this, {
                                chats: e
                            })
                        }
                    }, e.disableFilter = function() {
                        if (a) {
                            const e = this.getChatsWithUnreadOnTop();
                            o = !1, n = e, r.call(this, {
                                chats: e
                            })
                        } else o = !1, n = null, this.filtraChat(null)
                    }, e.getFilterState = function() {
                        return {
                            enabled: o,
                            unreadOnTop: a,
                            currentFilter: n
                        }
                    }, e.props.listeners.add((0, s.WhatsUpLoad)("WAWebChatCollection").ChatCollection, "change:unreadCount change:isAssignedToMe", (function() {
                        a && e.filtraChat(e.getChatsWithUnreadOnTop())
                    })), {
                        panel: e,
                        filtraChat: t => e.filtraChat(t),
                        disableFilter: () => e.disableFilter(),
                        getFilterState: () => e.getFilterState(),
                        enableUnreadChatsOnTop: () => function(e) {
                            e.setUnreadOnTop(!0);
                            const t = e.getChatsWithUnreadOnTop();
                            return e.filtraChat(t), !0
                        }(e),
                        disableUnreadChatsOnTop: () => function(e) {
                            return e.setUnreadOnTop(!1), e.filtraChat(null), !0
                        }(e)
                    }
                }();

                function pe() {
                    if (ue) return ue.enableUnreadChatsOnTop()
                }

                function ge() {
                    if (ue) return ue.disableUnreadChatsOnTop()
                }

                function he() {
                    if (ue) return ue.panel
                }

                function me(e) {
                    ue && ue.filtraChat(e)
                }

                function We() {
                    ue && ue.disableFilter()
                }

                function fe() {
                    if (ue) return ue.getFilterState()
                }
            },
            563: (e, t, n) => {
                "use strict";
                n.d(t, {
                    A: () => s
                });
                class o {
                    constructor() {
                        this.requests = new Map, this.requestId = 0, this.batchQueue = new Map, this.batchTimer = null, this.batchDelay = 10, this._engagementIndex = new Map, this._engagementIndexTime = Date.now(), this._normalizedIds = new Map, this._startIndexCleanup()
                    }
                    _startIndexCleanup() {
                        setInterval((() => {
                            this._engagementIndex && this._engagementIndex.size > 0 && Date.now() - this._engagementIndexTime > 6e4 && (this._engagementIndex.clear(), this._engagementIndexTime = Date.now(), console.log("[WUPE DB] 🧹 Índices limpos")), this._normalizedIds && this._normalizedIds.size > 1e3 && this._normalizedIds.clear()
                        }), 6e4)
                    }
                    create() {
                        const e = `req_${++this.requestId}_${Date.now()}_${Math.random()}`,
                            t = setTimeout((() => {
                                this.requests.has(e) && (console.error("[WUPE DB] Timeout para requestId:", e), this.reject(e, new Error("Timeout na operação de banco de dados")))
                            }), 1e4);
                        return {
                            id: e,
                            promise: new Promise(((n, o) => {
                                this.requests.set(e, {
                                    resolve: n,
                                    reject: o,
                                    timeoutId: t,
                                    timestamp: Date.now()
                                })
                            }))
                        }
                    }
                    resolve(e, t) {
                        const n = this.requests.get(e);
                        n ? (clearTimeout(n.timeoutId), n.resolve(t), this.requests.delete(e)) : console.warn("[WUPE DB] Request não encontrado:", e)
                    }
                    reject(e, t) {
                        const n = this.requests.get(e);
                        n && (clearTimeout(n.timeoutId), n.reject(t), this.requests.delete(e))
                    }
                    has(e) {
                        return this.requests.has(e)
                    }
                    scheduleBatchGet(e, t) {
                        return new Promise(((n, o) => {
                            this.batchQueue.set(e, {
                                fullKey: t,
                                resolve: n,
                                reject: o
                            }), this.batchTimer || (this.batchTimer = setTimeout((() => {
                                this.processBatch()
                            }), this.batchDelay))
                        }))
                    }
                    processBatch() {
                        if (0 === this.batchQueue.size) return;
                        const e = new Map(this.batchQueue);
                        this.batchQueue.clear(), this.batchTimer = null;
                        const t = Array.from(e.values()).map((e => e.fullKey)),
                            {
                                id: n,
                                promise: o
                            } = this.create();
                        window.dispatchEvent(new CustomEvent("WUPE_DB_GET_BATCH", {
                            detail: {
                                keys: t,
                                requestId: n
                            }
                        })), o.then((t => {
                            for (const [n, o] of e) {
                                const e = t[o.fullKey];
                                o.resolve(null != e ? e : null)
                            }
                        })).catch((t => {
                            for (const [n, o] of e) o.reject(t)
                        }))
                    }
                    cleanup() {
                        for (const [e, t] of this.requests) clearTimeout(t.timeoutId), t.reject(new Error("RequestManager cleanup"));
                        this.requests.clear(), this.batchTimer && (clearTimeout(this.batchTimer), this.batchTimer = null)
                    }
                }
                const s = new class {
                    constructor() {
                        this.user = null, this.listeners = new Map, this.requestManager = new o, this.initialized = !1, this.cache = new Map, this.cacheExpiry = 5e3, this.maxCacheSize = 500, this.pendingOperations = new Map, this.eventTypes = {
                            STATUS_SENT: "status_sent",
                            STATUS_SCHEDULED: "status_scheduled",
                            STATUS_VIEWED: "status_viewed",
                            STATUS_ENGAGEMENT: "status_engagement",
                            MESSAGE_NO_CONTACT: "message_no_contact",
                            DELETED_MESSAGE_RECOVERED: "deleted_message_recovered",
                            MESSAGE_WITH_NAME: "message_with_name",
                            CONVERSATION_PINNED: "conversation_pinned",
                            STATUS_DOWNLOADED: "status_downloaded",
                            CALL_REJECTED: "call_rejected"
                        }, this.trackingConfig = {
                            enabled: !0,
                            maxDaysToKeep: 90,
                            autoCleanInterval: 864e5,
                            maxEventsPerType: 1e4,
                            compactOldData: !0
                        }, this._setupEventListeners(), this._startAutoCleanup(), this._startCacheCleanup()
                    }
                    _setupEventListeners() {
                        window.addEventListener("WUPE_DB_GET_RESPONSE", (e => {
                            this.requestManager.resolve(e.detail.requestId, e.detail.value)
                        })), window.addEventListener("WUPE_DB_GET_BATCH_RESPONSE", (e => {
                            this.requestManager.resolve(e.detail.requestId, e.detail.data)
                        })), window.addEventListener("WUPE_DB_FIND_RESPONSE", (e => {
                            this.requestManager.resolve(e.detail.requestId, e.detail.data)
                        })), window.addEventListener("WUPE_DB_KEYS_RESPONSE", (e => {
                            this.requestManager.resolve(e.detail.requestId, e.detail.keys)
                        })), window.addEventListener("WUPE_DB_SUCCESS", (e => {
                            e.detail.requestId && this.requestManager.has(e.detail.requestId) && this.requestManager.resolve(e.detail.requestId, !0)
                        })), window.addEventListener("WUPE_DB_ERROR", (e => {
                            e.detail.requestId && this.requestManager.has(e.detail.requestId) && this.requestManager.reject(e.detail.requestId, new Error(e.detail.error))
                        })), window.addEventListener("WUPE_DB_GET_ALL_RESPONSE", (e => {
                            this.requestManager.resolve(e.detail.requestId, e.detail.data)
                        }))
                    }
                    async init() {
                        if (this.initialized) return this;
                        if (this.user = (() => {
                                try {
                                    return window.require("WAWebUserPrefsMeUser").getMaybeMePnUser()?.user || null
                                } catch (e) {
                                    return console.error("Erro ao obter usuário:", e), null
                                }
                            })(), !this.user) throw new Error("Usuário não identificado");
                        return this.initialized = !0, this
                    }
                    _buildKey(e) {
                        return `${this.user}${e}`
                    }
                    _getCached(e) {
                        const t = this.cache.get(e);
                        if (t && Date.now() - t.timestamp < this.cacheExpiry) return t.value
                    }
                    _setCache(e, t) {
                        if (this.cache.size >= this.maxCacheSize) {
                            const e = this.cache.keys().next().value;
                            this.cache.delete(e)
                        }
                        this.cache.set(e, {
                            value: t,
                            timestamp: Date.now()
                        })
                    }
                    _invalidateCache(e) {
                        if (this.cache.delete(e), e.includes("tracking_") || e.includes("_counter_"))
                            for (const e of this.cache.keys())(e.includes("tracking_") || e.includes("_counter_")) && this.cache.delete(e)
                    }
                    _startCacheCleanup() {
                        setInterval((() => {
                            const e = Date.now();
                            for (const [t, n] of this.cache.entries()) e - n.timestamp > this.cacheExpiry && this.cache.delete(t)
                        }), this.cacheExpiry)
                    }
                    async set(e, t) {
                        this.initialized || await this.init();
                        const n = this._buildKey(e),
                            {
                                id: o,
                                promise: s
                            } = this.requestManager.create();
                        return window.dispatchEvent(new CustomEvent("WUPE_DB_SET", {
                            detail: {
                                msg: n,
                                dir: t,
                                requestId: o
                            }
                        })), this._invalidateCache(e), this._notifyListeners(e, t, "set"), s
                    }
                    async get(e, t = null, n = !0) {
                        if (this.initialized || await this.init(), n) {
                            const t = this._getCached(e);
                            if (void 0 !== t) return t
                        }
                        const o = this._buildKey(e);
                        try {
                            const s = await this.requestManager.scheduleBatchGet(e, o),
                                a = null != s ? s : t;
                            return n && this._setCache(e, a), a
                        } catch (e) {
                            return console.error("[WUPE DB] Erro ao obter:", e), t
                        }
                    }
                    async getl() {
                        return this.initialized || await this.init(), await this.get("mylicenid", null)
                    }
                    async delete(e) {
                        this.initialized || await this.init();
                        const t = this._buildKey(e),
                            {
                                id: n,
                                promise: o
                            } = this.requestManager.create();
                        return window.dispatchEvent(new CustomEvent("WUPE_DB_DELETE", {
                            detail: {
                                msg: t,
                                requestId: n
                            }
                        })), this._invalidateCache(e), this._notifyListeners(e, null, "delete"), o
                    }
                    async has(e) {
                        return null !== await this.get(e)
                    }
                    async find(e) {
                        this.initialized || await this.init();
                        const t = e instanceof RegExp ? e.source : e,
                            n = `_find_${t}`,
                            o = this._getCached(n);
                        if (void 0 !== o) return o;
                        const {
                            id: s,
                            promise: a
                        } = this.requestManager.create();
                        window.dispatchEvent(new CustomEvent("WUPE_DB_FIND", {
                            detail: {
                                prefix: this.user,
                                pattern: t,
                                requestId: s
                            }
                        }));
                        const r = await a,
                            i = {};
                        for (const [e, t] of Object.entries(r)) i[e.replace(this.user, "")] = t;
                        return this._setCache(n, i), i
                    }
                    async keys() {
                        this.initialized || await this.init();
                        const e = "_all_keys",
                            t = this._getCached(e);
                        if (void 0 !== t) return t;
                        const {
                            id: n,
                            promise: o
                        } = this.requestManager.create();
                        window.dispatchEvent(new CustomEvent("WUPE_DB_KEYS", {
                            detail: {
                                prefix: this.user,
                                requestId: n
                            }
                        }));
                        const s = (await o).map((e => e.replace(this.user, "")));
                        return this._setCache(e, s), s
                    }
                    async values() {
                        const e = await this.getAll();
                        return Object.values(e)
                    }
                    async getAll() {
                        this.initialized || await this.init();
                        const e = "_get_all",
                            t = this._getCached(e);
                        if (void 0 !== t) return t;
                        const {
                            id: n,
                            promise: o
                        } = this.requestManager.create();
                        window.dispatchEvent(new CustomEvent("WUPE_DB_GET_ALL", {
                            detail: {
                                prefix: this.user,
                                requestId: n
                            }
                        }));
                        const s = await o,
                            a = {};
                        for (const [e, t] of Object.entries(s || {})) a[e.replace(this.user, "")] = t;
                        return this._setCache(e, a), a
                    }
                    async clear() {
                        this.initialized || await this.init();
                        const {
                            id: e,
                            promise: t
                        } = this.requestManager.create();
                        return window.dispatchEvent(new CustomEvent("WUPE_DB_CLEAR", {
                            detail: {
                                prefix: this.user,
                                requestId: e
                            }
                        })), this.cache.clear(), t
                    }
                    async setFile(e, t) {
                        this.initialized || await this.init();
                        const n = `file_${e}`;
                        return await this.set(n, t), !0
                    }
                    async getFile(e) {
                        this.initialized || await this.init();
                        const t = `file_${e}`,
                            n = await this.get(t);
                        return n ? {
                            name: e,
                            data: n,
                            size: n.length,
                            sizeKB: (n.length / 1024).toFixed(2),
                            sizeMB: (n.length / 1024 / 1024).toFixed(2)
                        } : null
                    }
                    async deleteFile(e) {
                        this.initialized || await this.init();
                        const t = `file_${e}`;
                        return await this.delete(t), !0
                    }
                    async listFiles() {
                        this.initialized || await this.init();
                        const e = await this.find(/^file_/),
                            t = [];
                        for (const [n, o] of Object.entries(e)) {
                            const e = n.replace("file_", "");
                            t.push({
                                fileName: e,
                                size: o.length,
                                sizeKB: (o.length / 1024).toFixed(2),
                                sizeMB: (o.length / 1024 / 1024).toFixed(2)
                            })
                        }
                        return t
                    }
                    async getFilesSize() {
                        this.initialized || await this.init();
                        const e = await this.find(/^file_/);
                        let t = 0,
                            n = 0;
                        for (const [o, s] of Object.entries(e)) t += (s || "").length, n++;
                        return {
                            totalFiles: n,
                            totalBytes: t,
                            totalKB: (t / 1024).toFixed(2),
                            totalMB: (t / 1024 / 1024).toFixed(2),
                            totalGB: (t / 1024 / 1024 / 1024).toFixed(2)
                        }
                    }
                    async fileExists(e) {
                        return this.initialized || await this.init(), await this.has(`file_${e}`)
                    }
                    async clearAllFiles() {
                        this.initialized || await this.init();
                        const e = await this.listFiles();
                        for (const t of e) this._invalidateCache(`file_${t.fileName}`);
                        const t = e.map((e => this.delete(`file_${e.fileName}`)));
                        return await Promise.all(t), e.length
                    }
                    async setJSON(e, t) {
                        return this.set(e, JSON.stringify(t))
                    }
                    async getJSON(e, t = null) {
                        const n = await this.get(e);
                        if (!n) return t;
                        try {
                            return JSON.parse(n)
                        } catch (e) {
                            return console.error("[WUPE DB] Erro ao parsear JSON:", e), t
                        }
                    }
                    on(e, t) {
                        return this.listeners.has(e) || this.listeners.set(e, []), this.listeners.get(e).push(t), () => this.off(e, t)
                    }
                    off(e, t) {
                        if (!this.listeners.has(e)) return;
                        const n = this.listeners.get(e),
                            o = n.indexOf(t);
                        o > -1 && n.splice(o, 1)
                    }
                    _notifyListeners(e, t, n) {
                        this.listeners.has(e) && this.listeners.get(e).forEach((o => {
                            try {
                                o({
                                    key: e,
                                    value: t,
                                    operation: n,
                                    timestamp: Date.now()
                                })
                            } catch (e) {
                                console.error("[WUPE DB] Erro no listener:", e)
                            }
                        }))
                    }
                    _getTrackingKey(e) {
                        return `tracking_${e}`
                    }
                    _formatDate(e) {
                        return `${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`
                    }
                    async trackEvent(e, t = {}) {
                        if (!this.trackingConfig.enabled) return !1;
                        this.initialized || await this.init();
                        try {
                            const n = {
                                    type: e,
                                    subtype: t.subtype || null,
                                    timestamp: Date.now(),
                                    date: this._formatDate(new Date),
                                    contactId: t.contactId || null,
                                    messageId: t.messageId || null,
                                    extra: t.extra || {}
                                },
                                o = this._getTrackingKey(e),
                                s = await this.getJSON(o, []);
                            return s.push(n), await this.setJSON(o, s), await this._updateQuickCounter(e, t.subtype), !0
                        } catch (e) {
                            return console.error("[WUPE TRACKING] Erro ao registrar evento:", e), !1
                        }
                    }
                    async _updateQuickCounter(e, t) {
                        try {
                            const n = `_counter_${e}`,
                                o = await this.getJSON(n, {
                                    total: 0,
                                    subtypes: {}
                                });
                            o.total++, t && (o.subtypes[t] = (o.subtypes[t] || 0) + 1), await this.setJSON(n, o)
                        } catch (e) {
                            console.error("[WUPE TRACKING] Erro ao atualizar contador:", e)
                        }
                    }
                    async _filterAsync(e, t, n = 1e3) {
                        const o = [];
                        for (let s = 0; s < e.length; s += n) {
                            const a = e.slice(s, s + n);
                            o.push(...a.filter(t)), s + n < e.length && await new Promise((e => setTimeout(e, 0)))
                        }
                        return o
                    }
                    async getTrackingStats() {
                        this.initialized || await this.init();
                        const e = "_tracking_stats",
                            t = this._getCached(e);
                        if (void 0 !== t) return t;
                        const n = {},
                            o = (await this.keys()).filter((e => e.startsWith("tracking_") && !e.includes("_counter_") && !e.startsWith("tracking_summary_")));
                        for (const e of o) {
                            const t = e.replace("tracking_", ""),
                                o = `_counter_${t}`,
                                s = await this.getJSON(o, null);
                            if (s) n[t] = s.total, Object.keys(s.subtypes || {}).length > 0 && (n[`${t}_by_type`] = s.subtypes);
                            else {
                                const o = await this.getJSON(e, []);
                                n[t] = o.length
                            }
                        }
                        return this._setCache(e, n), n
                    }
                    async getTrackingStat(e) {
                        this.initialized || await this.init();
                        try {
                            const t = `_counter_${e}`,
                                n = await this.getJSON(t, null);
                            return n ? n.total : (await this.getJSON(this._getTrackingKey(e), [])).length
                        } catch (e) {
                            return console.error("[WUPE TRACKING] Erro ao obter estatística:", e), 0
                        }
                    }
                    async getTrackingStatsByDate(e, t) {
                        this.initialized || await this.init();
                        const n = e.getTime(),
                            o = t.getTime(),
                            s = {},
                            a = (await this.keys()).filter((e => e.startsWith("tracking_") && !e.includes("_counter_") && !e.startsWith("tracking_summary_")));
                        for (const e of a) {
                            const t = e.replace("tracking_", ""),
                                a = await this.getJSON(e, []),
                                r = await this._filterAsync(a, (e => e.timestamp >= n && e.timestamp <= o));
                            s[t] = r.length
                        }
                        return s
                    }
                    _normalizeStatusId(e) {
                        if (!e) return "";
                        if (/^[A-F0-9]{22}$/i.test(e)) return e.toUpperCase();
                        const t = e.match(/([A-F0-9]{22})/i);
                        return t ? t[1].toUpperCase() : e.toUpperCase()
                    }
                    async getStatusReplies(e) {
                        this.initialized || await this.init();
                        try {
                            const t = this._normalizeStatusId(e),
                                n = this._getTrackingKey(this.eventTypes.STATUS_ENGAGEMENT),
                                o = await this.getJSON(n, []),
                                s = await this._filterAsync(o, (e => {
                                    if ("reply" !== e.subtype) return !1;
                                    const n = e.messageId || "",
                                        o = e.extra?.statusId || "",
                                        s = this._normalizeStatusId(n);
                                    return this._normalizeStatusId(o) === t || s === t
                                }));
                            return s.sort(((e, t) => {
                                const n = e.extra?.timestamp || e.timestamp || 0;
                                return (t.extra?.timestamp || t.timestamp || 0) - n
                            })), s
                        } catch (e) {
                            return console.error("[WUPE DB] ❌ Erro ao buscar replies:", e), []
                        }
                    }
                    async getStatusRepliesStats_old(e) {
                        this.initialized || await this.init();
                        try {
                            const t = this._normalizeStatusId(e),
                                n = this._getTrackingKey(this.eventTypes.STATUS_ENGAGEMENT),
                                o = await this.getJSON(n, []),
                                s = await this._filterAsync(o, (e => {
                                    if ("reply" !== e.subtype) return !1;
                                    const n = e.messageId || "",
                                        o = e.extra?.statusId || "",
                                        s = this._normalizeStatusId(n);
                                    return this._normalizeStatusId(o) === t || s === t
                                }));
                            if (0 === s.length) return {
                                total: 0,
                                today: 0,
                                uniqueUsers: 0,
                                recentReplies: []
                            };
                            s.sort(((e, t) => {
                                const n = e.extra?.timestamp || e.timestamp || 0;
                                return (t.extra?.timestamp || t.timestamp || 0) - n
                            }));
                            const a = new Date,
                                r = new Date(a);
                            r.setHours(0, 0, 0, 0);
                            const i = r.getTime(),
                                c = s.filter((e => (e.extra?.timestamp || e.timestamp || 0) >= i)).length,
                                l = new Set(s.map((e => e.contactId))).size,
                                d = s.slice(0, 5).map((e => ({
                                    userId: e.contactId,
                                    content: e.extra?.content || "",
                                    timestamp: e.extra?.timestamp || e.timestamp || 0,
                                    date: new Date(e.extra?.timestamp || e.timestamp || 0).toLocaleString("pt-BR")
                                })));
                            return {
                                total: s.length,
                                today: c,
                                uniqueUsers: l,
                                recentReplies: d
                            }
                        } catch (e) {
                            return console.error("[WUPE DB] ❌ Erro ao buscar estatísticas de replies:", e), {
                                total: 0,
                                today: 0,
                                uniqueUsers: 0,
                                recentReplies: []
                            }
                        }
                    }
                    async getStatusRepliesStats(e) {
                        this.initialized || await this.init();
                        try {
                            const t = this._normalizeStatusId(e),
                                n = `_replies_stats_${t}`,
                                o = this._getCached(n);
                            if (void 0 !== o) return o;
                            this._engagementIndex || (this._engagementIndex = new Map, this._engagementIndexTime = Date.now()), Date.now() - this._engagementIndexTime > 3e4 && (this._engagementIndex.clear(), this._engagementIndexTime = Date.now());
                            let s = this._engagementIndex.get(t);
                            if (!s) {
                                const e = this._getTrackingKey(this.eventTypes.STATUS_ENGAGEMENT),
                                    n = await this.getJSON(e, []);
                                s = [];
                                for (const e of n) {
                                    if ("reply" !== e.subtype) continue;
                                    const n = e.messageId || "",
                                        o = e.extra?.statusId || "";
                                    this._normalizedIds || (this._normalizedIds = new Map);
                                    let a = this._normalizedIds.get(n);
                                    a || (a = this._normalizeStatusId(n), this._normalizedIds.set(n, a));
                                    let r = this._normalizedIds.get(o);
                                    r || (r = this._normalizeStatusId(o), this._normalizedIds.set(o, r)), r !== t && a !== t || s.push(e)
                                }
                                if (s.sort(((e, t) => {
                                        const n = e.extra?.timestamp || e.timestamp || 0;
                                        return (t.extra?.timestamp || t.timestamp || 0) - n
                                    })), this._engagementIndex.set(t, s), this._engagementIndex.size > 100) {
                                    const e = this._engagementIndex.keys().next().value;
                                    this._engagementIndex.delete(e)
                                }
                            }
                            if (0 === s.length) {
                                const e = {
                                    total: 0,
                                    today: 0,
                                    uniqueUsers: 0,
                                    recentReplies: []
                                };
                                return this._setCache(n, e), e
                            }
                            const a = new Date;
                            a.setHours(0, 0, 0, 0);
                            const r = a.getTime();
                            let i = 0;
                            const c = new Set,
                                l = [],
                                d = Math.max(5, Math.min(s.length, 100));
                            for (let e = 0; e < s.length && e < d; e++) {
                                const t = s[e],
                                    n = t.extra?.timestamp || t.timestamp || 0;
                                n >= r && i++, t.contactId && c.add(t.contactId), l.length < 5 && l.push({
                                    userId: t.contactId,
                                    content: t.extra?.content || "",
                                    timestamp: n,
                                    date: new Date(n).toLocaleString("pt-BR")
                                })
                            }
                            if (s.length > d)
                                for (let e = d; e < s.length; e++) s[e].contactId && c.add(s[e].contactId), (s[e].extra?.timestamp || s[e].timestamp || 0) >= r && i++;
                            const u = {
                                total: s.length,
                                today: i,
                                uniqueUsers: c.size,
                                recentReplies: l
                            };
                            return this._setCache(n, u), u
                        } catch (e) {
                            return console.error("[WUPE DB] ❌ Erro ao buscar estatísticas de replies:", e), {
                                total: 0,
                                today: 0,
                                uniqueUsers: 0,
                                recentReplies: []
                            }
                        }
                    }
                    async getTrackingEvents(e, t = {}) {
                        this.initialized || await this.init();
                        const {
                            limit: n = 100,
                            subtype: o = null
                        } = t;
                        try {
                            let t = await this.getJSON(this._getTrackingKey(e), []);
                            return o && (t = await this._filterAsync(t, (e => e.subtype === o))), t.sort(((e, t) => t.timestamp - e.timestamp)), t.slice(0, n)
                        } catch (e) {
                            return console.error("[WUPE TRACKING] Erro ao obter eventos:", e), []
                        }
                    }
                    async resetTrackingStats() {
                        this.initialized || await this.init();
                        try {
                            const e = (await this.keys()).filter((e => e.startsWith("tracking_") || e.startsWith("_counter_") || e.startsWith("status_ack_") || e.startsWith("_tracked_"))).map((e => this.delete(e)));
                            return await Promise.all(e), !0
                        } catch (e) {
                            return console.error("[WUPE TRACKING] Erro ao resetar estatísticas:", e), !1
                        }
                    }
                    _startAutoCleanup() {
                        setInterval((async () => {
                            this.trackingConfig.enabled && this.initialized
                        }), this.trackingConfig.autoCleanInterval)
                    }
                    async trackStatusSent(e = {}) {
                        return this.trackEvent(this.eventTypes.STATUS_SENT, {
                            subtype: e.type,
                            messageId: e.statusId,
                            extra: {
                                duration: e.duration || null,
                                timestamp: Date.now()
                            }
                        })
                    }
                    async trackStatusScheduledByContent(e, t) {
                        return this.trackStatusScheduled({
                            name: e,
                            conteudo: t
                        })
                    }
                    async trackStatusScheduled(e) {
                        let t, n, o, s;
                        if (this.initialized || await this.init(), e.name && e.conteudo) t = e.name, o = e.conteudo.horariododisparo, s = e.conteudo, n = "text", e.conteudo.arquivo64?.length > 0 ? n = e.conteudo.arquivo64[0].tipodoarquivo : e.conteudo.arquivo?.length > 0 && (n = e.conteudo.arquivo[0].tipodoarquivo);
                        else {
                            if (void 0 !== e.horariododisparo) return console.error("[WUPE SCHEDULE] ❌ Nome do agendamento não encontrado. Use formato: { name, conteudo }"), !1;
                            if (!e.name || !e.scheduledTime) return console.error("[WUPE SCHEDULE] ❌ Formato de dados inválido"), !1;
                            t = e.name, n = e.type || "text", o = e.scheduledTime, s = e.content || null
                        }
                        return t && o ? this.trackEvent(this.eventTypes.STATUS_SCHEDULED, {
                            subtype: n || "text",
                            messageId: t,
                            extra: {
                                scheduledTime: o,
                                status: "pending",
                                timestamp: Date.now(),
                                content: s || null
                            }
                        }) : (console.error("[WUPE SCHEDULE] ❌ Nome ou horário de disparo não fornecido"), !1)
                    }
                    async markScheduleAsSent(e) {
                        this.initialized || await this.init();
                        const t = (await this.getTrackingEvents(this.eventTypes.STATUS_SCHEDULED, {
                            limit: 1e3
                        })).find((t => t.messageId === e));
                        return t ? this.trackEvent(this.eventTypes.STATUS_SCHEDULED, {
                            subtype: t.subtype,
                            messageId: e,
                            extra: {
                                scheduledTime: t.extra?.scheduledTime,
                                status: "sent",
                                previousStatus: "pending",
                                sentAt: Date.now(),
                                timestamp: Date.now()
                            }
                        }) : (console.warn("[WUPE SCHEDULE] ⚠️ Agendamento não encontrado:", e), !1)
                    }
                    async deleteScheduleTracking(e) {
                        this.initialized || await this.init();
                        const t = (await this.getJSON(this._getTrackingKey(this.eventTypes.STATUS_SCHEDULED), [])).filter((t => t.messageId !== e));
                        return await this.setJSON(this._getTrackingKey(this.eventTypes.STATUS_SCHEDULED), t), !0
                    }
                    async trackStatusView(e = {}) {
                        if (!e.statusId || !e.viewerId) return console.error("[WUPE TRACK] ❌ statusId ou viewerId ausente:", e), !1;
                        const t = `_tracked_${e.statusId}_${e.viewerId}`;
                        return !await this.get(t) && (await this.set(t, Date.now()), await this.trackEvent(this.eventTypes.STATUS_VIEWED, {
                            messageId: e.statusId,
                            contactId: e.viewerId,
                            subtype: e.statusType,
                            extra: {
                                ...e.extra,
                                timestamp: e.extra?.timestamp || Date.now()
                            }
                        }))
                    }
                    async trackStatusEngagement(e = {}) {
                        if (!e.statusId || !e.userId) return console.error("[WUPE TRACK] ❌ statusId ou userId ausente:", e), !1;
                        const t = e.replyMessageId || `${e.statusId}_${e.userId}_${e.extra?.content?.substring(0,20)||""}_${e.extra?.timestamp||Date.now()}`,
                            n = `_tracked_engagement_${t}`;
                        if (await this.get(n)) return !1;
                        await this.set(n, Date.now());
                        const o = await this.trackEvent(this.eventTypes.STATUS_ENGAGEMENT, {
                            messageId: e.statusId,
                            contactId: e.userId,
                            subtype: e.interactionType,
                            extra: {
                                replyMessageId: t,
                                content: e.extra?.content,
                                timestamp: e.extra?.timestamp || Date.now(),
                                statusAuthor: e.extra?.statusAuthor,
                                ...e.extra
                            }
                        });
                        if (o && e.statusId) {
                            const t = this._normalizeStatusId(e.statusId);
                            this._invalidateCache(`_replies_stats_${t}`), this._engagementIndex && this._engagementIndex.delete(t)
                        }
                        return o
                    }
                    async getScheduledStatusPending() {
                        try {
                            const e = await this.get("statusautoprogramadas");
                            if (!e) return 0;
                            const t = JSON.parse(e);
                            return Array.isArray(t) ? t.filter((e => !1 === e?.conteudo?.enviado)).length : (console.warn("[WUPE DB] statusautoprogramadas não é um array"), 0)
                        } catch (e) {
                            return console.error("[WUPE DB] Erro ao obter agendados pendentes:", e), 0
                        }
                    }
                    async updateScheduledStatus(e, t) {
                        const n = (await this.getTrackingEvents(this.eventTypes.STATUS_SCHEDULED, {
                            limit: 1e3
                        })).find((t => t.messageId === e));
                        n && await this.trackEvent(this.eventTypes.STATUS_SCHEDULED, {
                            subtype: n.subtype,
                            messageId: e,
                            extra: {
                                scheduledTime: n.extra.scheduledTime,
                                status: t,
                                previousStatus: n.extra.status,
                                timestamp: Date.now()
                            }
                        })
                    }
                    async getStatusStatistics() {
                        this.initialized || await this.init();
                        const e = "_status_statistics",
                            t = this._getCached(e);
                        if (void 0 !== t) return t;
                        const n = new Date,
                            o = new Date(n);
                        o.setHours(0, 0, 0, 0);
                        const s = new Date(o);
                        s.setDate(s.getDate() - 1);
                        const a = new Date(n);
                        a.setDate(a.getDate() - 7);
                        try {
                            const t = o.getTime(),
                                n = s.getTime(),
                                r = a.getTime(),
                                i = this._getTrackingKey(this.eventTypes.STATUS_VIEWED),
                                c = await this.getJSON(i, []),
                                l = this._getTrackingKey(this.eventTypes.STATUS_ENGAGEMENT),
                                d = await this.getJSON(l, []),
                                u = await this._filterAsync(d, (e => "reply" === e.subtype)),
                                p = await this._filterAsync(d, (e => "reaction" === e.subtype)),
                                g = this._getTrackingKey(this.eventTypes.STATUS_SENT),
                                h = await this.getJSON(g, []),
                                m = this._getTrackingKey(this.eventTypes.STATUS_SCHEDULED),
                                W = await this.getJSON(m, []),
                                f = new Map;
                            W.forEach((e => {
                                const t = e.messageId,
                                    n = f.get(t);
                                (!n || e.timestamp > n.timestamp) && f.set(t, e)
                            }));
                            const b = c.length,
                                y = await this._filterAsync(c, (e => (e.extra?.timestamp || e.timestamp || 0) >= t)),
                                A = await this._filterAsync(c, (e => {
                                    const o = e.extra?.timestamp || e.timestamp || 0;
                                    return o >= n && o < t
                                })),
                                E = u.length + p.length,
                                S = await this._filterAsync([...u, ...p], (e => (e.extra?.timestamp || e.timestamp || 0) >= t)),
                                w = await this._filterAsync([...u, ...p], (e => {
                                    const o = e.extra?.timestamp || e.timestamp || 0;
                                    return o >= n && o < t
                                })),
                                v = b > 0 ? parseFloat((E / b * 100).toFixed(1)) : 0,
                                C = A.length > 0 ? parseFloat((w.length / A.length * 100).toFixed(1)) : 0,
                                _ = y.length > 0 ? parseFloat((S.length / y.length * 100).toFixed(1)) : 0,
                                T = parseFloat((_ - C).toFixed(1)),
                                M = {
                                    totalEnviados: h.length,
                                    trendSemana: h.filter((e => e.timestamp >= r)).length,
                                    totalAgendados: W.length,
                                    agendadosPendentes: Array.from(f.values()).filter((e => "sent" !== e.extra?.status)).length,
                                    views: b,
                                    viewsHoje: y.length,
                                    engagement: v,
                                    engagementTrend: T
                                };
                            return this._setCache(e, M), M
                        } catch (e) {
                            return console.error("[WUPE STATS] Erro:", e), {
                                totalEnviados: 0,
                                trendSemana: 0,
                                totalAgendados: 0,
                                agendadosPendentes: 0,
                                views: 0,
                                viewsHoje: 0,
                                engagement: 0,
                                engagementTrend: 0
                            }
                        }
                    }
                    async processStatusAck_old_ruim(e, t) {
                        this.initialized || await this.init();
                        try {
                            if (t instanceof Promise && (t = await t), !t) return console.error("[WUPE ACK] ❌ ackInfo é null ou undefined"), null;
                            const n = await this.getStatusAckSummary(e),
                                o = new Set(n?.allViewers || []),
                                s = new Set,
                                a = new Map;
                            if (t.read && Array.isArray(t.read) && t.read.length > 0)
                                for (const e of t.read) {
                                    const t = "string" == typeof e ? e : e.id || e._serialized;
                                    if (!t) continue;
                                    const n = e.t ? 10 === e.t.toString().length ? 1e3 * e.t : e.t : Date.now();
                                    s.add(t), a.has(t) || a.set(t, {
                                        timestamp: n,
                                        type: "image"
                                    })
                                }
                            if (t.played && Array.isArray(t.played) && t.played.length > 0)
                                for (const e of t.played) {
                                    const t = "string" == typeof e ? e : e.id || e._serialized;
                                    if (!t) continue;
                                    const n = e.t ? 10 === e.t.toString().length ? 1e3 * e.t : e.t : Date.now();
                                    s.add(t), a.has(t) ? a.get(t).type = "video" : a.set(t, {
                                        timestamp: n,
                                        type: "video"
                                    })
                                }
                            let r = 0,
                                i = 0;
                            const c = [];
                            for (const [t, n] of a) o.has(t) ? i++ : c.push(this.trackStatusView({
                                statusId: e,
                                viewerId: t,
                                statusType: n.type,
                                timestamp: n.timestamp
                            }).then((e => {
                                e && r++
                            })));
                            await Promise.all(c);
                            const l = new Set([...o, ...s]);
                            await this.saveStatusAckSummary(e, t, Array.from(l));
                            const d = (t.read?.length || 0) + (t.played?.length || 0);
                            return {
                                totalViews: d,
                                totalViewsEstimated: d + Math.max(0, t.readRemaining || 0) + Math.max(0, t.playedRemaining || 0),
                                statusType: (t.played?.length || 0) > 0 ? "video" : "image",
                                newViewers: r,
                                uniqueViewers: l.size,
                                isDuplicate: 0 === r,
                                viewers: Array.from(l),
                                skipped: i,
                                breakdown: {
                                    reads: t.read?.length || 0,
                                    plays: t.played?.length || 0,
                                    readRemaining: Math.max(0, t.readRemaining || 0),
                                    playedRemaining: Math.max(0, t.playedRemaining || 0)
                                }
                            }
                        } catch (e) {
                            return console.error("[WUPE ACK] ❌ ERRO NO PROCESSAMENTO:", e), console.error("[WUPE ACK] Stack trace:", e.stack), null
                        }
                    }
                    async processStatusAck(e, t) {
                        this.initialized || await this.init();
                        try {
                            if (t instanceof Promise && (t = await t), !t) return console.error("[WUPE ACK] ❌ ackInfo é null ou undefined"), null;
                            const n = await this.getStatusAckSummary(e),
                                o = new Set(n?.allViewers || []),
                                s = new Set,
                                a = new Map;
                            if (t.read && Array.isArray(t.read) && t.read.length > 0)
                                for (const e of t.read) {
                                    const t = "string" == typeof e ? e : e.id || e._serialized;
                                    if (!t) continue;
                                    const n = e.t ? 10 === e.t.toString().length ? 1e3 * e.t : e.t : Date.now();
                                    s.add(t), a.has(t) || a.set(t, {
                                        timestamp: n,
                                        type: "image"
                                    })
                                }
                            if (t.played && Array.isArray(t.played) && t.played.length > 0)
                                for (const e of t.played) {
                                    const t = "string" == typeof e ? e : e.id || e._serialized;
                                    if (!t) continue;
                                    const n = e.t ? 10 === e.t.toString().length ? 1e3 * e.t : e.t : Date.now();
                                    s.add(t), a.has(t) ? a.get(t).type = "video" : a.set(t, {
                                        timestamp: n,
                                        type: "video"
                                    })
                                }
                            const r = [],
                                i = [];
                            for (const [t, n] of a)
                                if (!o.has(t)) {
                                    const o = `_tracked_${e}_${t}`;
                                    i.push(this.get(o).then((e => {
                                        e || r.push({
                                            viewerId: t,
                                            data: n,
                                            checkKey: o
                                        })
                                    })))
                                } await Promise.all(i);
                            let c = r.length,
                                l = a.size - c;
                            if (0 === r.length) {
                                const n = new Set([...o, ...s]);
                                return await this.saveStatusAckSummary(e, t, Array.from(n)), {
                                    totalViews: (t.read?.length || 0) + (t.played?.length || 0),
                                    totalViewsEstimated: (t.read?.length || 0) + (t.played?.length || 0) + Math.max(0, t.readRemaining || 0) + Math.max(0, t.playedRemaining || 0),
                                    statusType: (t.played?.length || 0) > 0 ? "video" : "image",
                                    newViewers: 0,
                                    uniqueViewers: n.size,
                                    isDuplicate: !0,
                                    viewers: Array.from(n),
                                    skipped: l,
                                    breakdown: {
                                        reads: t.read?.length || 0,
                                        plays: t.played?.length || 0,
                                        readRemaining: Math.max(0, t.readRemaining || 0),
                                        playedRemaining: Math.max(0, t.playedRemaining || 0)
                                    }
                                }
                            }
                            const d = r.map((({
                                checkKey: e
                            }) => this.set(e, Date.now())));
                            await Promise.all(d), await this._batchTrackStatusViews(e, r);
                            const u = new Set([...o, ...s]);
                            await this.saveStatusAckSummary(e, t, Array.from(u));
                            const p = (t.read?.length || 0) + (t.played?.length || 0);
                            return {
                                totalViews: p,
                                totalViewsEstimated: p + Math.max(0, t.readRemaining || 0) + Math.max(0, t.playedRemaining || 0),
                                statusType: (t.played?.length || 0) > 0 ? "video" : "image",
                                newViewers: c,
                                uniqueViewers: u.size,
                                isDuplicate: !1,
                                viewers: Array.from(u),
                                skipped: l,
                                breakdown: {
                                    reads: t.read?.length || 0,
                                    plays: t.played?.length || 0,
                                    readRemaining: Math.max(0, t.readRemaining || 0),
                                    playedRemaining: Math.max(0, t.playedRemaining || 0)
                                }
                            }
                        } catch (e) {
                            return console.error("[WUPE ACK] ❌ ERRO NO PROCESSAMENTO:", e), console.error("[WUPE ACK] Stack trace:", e.stack), null
                        }
                    }
                    async _batchTrackStatusViews(e, t) {
                        if (0 === t.length) return;
                        const n = this._getTrackingKey(this.eventTypes.STATUS_VIEWED),
                            o = await this.getJSON(n, []),
                            s = Date.now(),
                            a = t.map((({
                                viewerId: t,
                                data: n
                            }) => ({
                                type: this.eventTypes.STATUS_VIEWED,
                                subtype: n.type,
                                timestamp: s,
                                date: this._formatDate(new Date(s)),
                                contactId: t,
                                messageId: e,
                                extra: {
                                    timestamp: n.timestamp
                                }
                            })));
                        o.push(...a), await this.setJSON(n, o);
                        const r = `_counter_${this.eventTypes.STATUS_VIEWED}`,
                            i = await this.getJSON(r, {
                                total: 0,
                                subtypes: {}
                            });
                        i.total += t.length;
                        for (const {
                                data: e
                            } of t) i.subtypes[e.type] = (i.subtypes[e.type] || 0) + 1;
                        await this.setJSON(r, i)
                    }
                    async saveStatusAckSummary(e, t, n = []) {
                        const o = `status_ack_${e}`,
                            s = await this.getJSON(o, null),
                            a = {
                                statusId: e,
                                firstProcessed: s?.firstProcessed || Date.now(),
                                lastUpdate: Date.now(),
                                updateCount: (s?.updateCount || 0) + 1,
                                allViewers: n,
                                delivery: {
                                    count: t.delivery?.length || 0,
                                    remaining: Math.max(0, t.deliveryRemaining || 0),
                                    total: (t.delivery?.length || 0) + Math.max(0, t.deliveryRemaining || 0),
                                    viewers: t.delivery?.map((e => "string" == typeof e ? e : e.id || e._serialized)).filter(Boolean) || []
                                },
                                read: {
                                    count: t.read?.length || 0,
                                    remaining: Math.max(0, t.readRemaining || 0),
                                    total: (t.read?.length || 0) + Math.max(0, t.readRemaining || 0),
                                    viewers: t.read?.map((e => "string" == typeof e ? e : e.id || e._serialized)).filter(Boolean) || []
                                },
                                played: {
                                    count: t.played?.length || 0,
                                    remaining: Math.max(0, t.playedRemaining || 0),
                                    total: (t.played?.length || 0) + Math.max(0, t.playedRemaining || 0),
                                    viewers: t.played?.map((e => "string" == typeof e ? e : e.id || e._serialized)).filter(Boolean) || []
                                },
                                history: [...(s?.history || []).slice(-9), {
                                    timestamp: Date.now(),
                                    reads: t.read?.length || 0,
                                    plays: t.played?.length || 0,
                                    totalViewers: n.length,
                                    readRemaining: Math.max(0, t.readRemaining || 0),
                                    playedRemaining: Math.max(0, t.playedRemaining || 0)
                                }]
                            };
                        return await this.setJSON(o, a), a
                    }
                    async getStatusAckSummary(e) {
                        return this.initialized || await this.init(), await this.getJSON(`status_ack_${e}`, null)
                    }
                    async getStatusViewers(e) {
                        this.initialized || await this.init();
                        const t = await this.getStatusAckSummary(e);
                        return t?.allViewers || []
                    }
                    async getDetailedStatusStats(e) {
                        this.initialized || await this.init();
                        const t = await this.getStatusAckSummary(e);
                        return t ? {
                            statusId: e,
                            found: !0,
                            uniqueViews: t.allViewers?.length || 0,
                            totalViews: (t.read?.count || 0) + (t.played?.count || 0),
                            totalEstimated: (t.read?.total || 0) + (t.played?.total || 0),
                            breakdown: {
                                delivered: t.delivery?.total || 0,
                                deliveredCount: t.delivery?.count || 0,
                                reads: t.read?.count || 0,
                                readsRemaining: t.read?.remaining || 0,
                                readsTotal: t.read?.total || 0,
                                readViewers: t.read?.viewers || [],
                                plays: t.played?.count || 0,
                                playsRemaining: t.played?.remaining || 0,
                                playsTotal: t.played?.total || 0,
                                playViewers: t.played?.viewers || []
                            },
                            viewers: t.allViewers || [],
                            viewersByType: {
                                read: t.read?.viewers || [],
                                played: t.played?.viewers || []
                            },
                            processing: {
                                firstProcessed: new Date(t.firstProcessed).toLocaleString("pt-BR"),
                                lastUpdate: new Date(t.lastUpdate).toLocaleString("pt-BR"),
                                updateCount: t.updateCount,
                                history: t.history || []
                            }
                        } : {
                            statusId: e,
                            found: !1,
                            uniqueViews: 0,
                            totalEstimated: 0
                        }
                    }
                    destroy() {
                        this.requestManager.cleanup(), this.cache.clear(), this.listeners.clear()
                    }
                }
            },
            794: (e, t, n) => {
                "use strict";
                n.d(t, {
                    I: () => a
                });
                var o = n(7);
                class s extends o.EventEmitter {}
                const a = new s
            },
            456: (e, t, n) => {
                "use strict";
                var o = n(658),
                    s = n(794),
                    a = n(743);
                const r = (0, o.findModuleByFunction)("upsertVotesDb"),
                    i = r.upsertVotesDb,
                    c = (0, o.WhatsUpLoad)("WAWebMsgCollection").MsgCollection,
                    l = (0, o.WhatsUpLoad)("WAWebGroupExitJob"),
                    d = l?.leaveGroup;
                let u = {
                    id: "",
                    votes: []
                };
                const p = Date.now();

                function g(e) {
                    const t = new Date(e);
                    return `${h(t.getDate())}/${h(t.getMonth()+1)}/${t.getFullYear()} ${h(t.getHours())}:${h(t.getMinutes())}:${h(t.getSeconds())}`
                }

                function h(e) {
                    return e < 10 ? "0" + e : e
                }
                l.leaveGroup = (0, o.wrapf)(d, (async (e, ...t) => {
                    let [n] = t;
                    try {
                        return s.I.emit("saiu_g", n), e(...t)
                    } catch (e) {}
                })), r.upsertVotesDb = (0, o.wrapf)(i, (async (e, ...t) => {
                    let [n] = t;
                    try {
                        if (n[0].senderTimestampMs < p) return e(...t);
                        const o = await c.get(n[0].parentMsgKey),
                            a = [];
                        for (const e of n[0].selectedOptionLocalIds) a[e] = o.pollOptions.filter((t => t.localId == e))[0];
                        let r = {};
                        if (r.id = n[0].parentMsgKey.id, r.votes = n[0].selectedOptionLocalIds, JSON.stringify(r) !== JSON.stringify(u)) {
                            u.id = n[0].parentMsgKey.id, u.votes = n[0].selectedOptionLocalIds;
                            let e = n[0];
                            s.I.emit("vt", {
                                msgId: e.parentMsgKey,
                                chatId: e.parentMsgKey.remote,
                                selectedOptions: a,
                                timestamp: g(e.senderTimestampMs),
                                data_atual: g(p),
                                sender: e.sender
                            })
                        }
                        return e(...t)
                    } catch (e) {}
                }));
                const m = (0, o.WhatsUpLoad)("WAWebMsgCollection").MsgCollection,
                    W = (0, o.WhatsUpLoad)("WAWebContactCollection").ContactCollection;
                (0, o.WhatsUpLoad)("WAWebChatCollection").ChatCollection.on("change:unreadCount", (e => {
                    try {
                        let e = (0, a.n)().filter((e => e.unreadCount >= 1 && e.isUser)).length;
                        document.getElementById("unreadcount").innerHTML = e, 0 == e ? $("#unreadcount").addClass("fundocont") : $("#unreadcount").removeClass("fundocont");
                        let n = (0, a.n)().filter((e => e.isGroup)).length;
                        document.getElementById("groupcount").innerHTML = n;
                        let o = (0, a.n)().filter((e => !e.isMyContact && e.isUser && !e.isGroup)).length;
                        document.getElementById("ncontactcount").innerHTML = o;
                        let s = (0, a.n)().filter((e => e.isMyContact)).length;
                        document.getElementById("contactcount").innerHTML = s;
                        let r = (0, a.n)().filter((e => e.t)).length;
                        document.getElementById("allcount").innerHTML = r;
                        let i = (0, a.n)().filter((e => e.isUser && !e.hasUnread && (e.lastReceivedKey ? e.lastReceivedKey.fromMe : ""))).length;
                        document.getElementById("respeucount").innerHTML = i;
                        let c = (0, a.n)().filter((e => e.isUser && !e.hasUnread && (e.lastReceivedKey ? !e.lastReceivedKey.fromMe : ""))).length;
                        document.getElementById("respcount").innerHTML = c;
                        var t = 0;
                        $(".filtrachats .nav-1tem").each((function() {
                            t += $(this).width()
                        })), $(".filtrachats").width(t + 50)
                    } catch (e) {}
                })), m.on("add", (e => {
                    s.I.emit("recebe_m", e)
                })), m.on("change:asRevoked", (e => {
                    s.I.emit("muda_r", e)
                })), W.on("change:name", (e => {
                    s.I.emit("muda_n", e)
                })), W.on("add", (e => {
                    s.I.emit("add_c", e)
                }))
            },
            44: (e, t, n) => {
                "use strict";
                n.a(e, (async (e, o) => {
                    try {
                        n.r(t), n.d(t, {
                            chat: () => l,
                            db: () => b,
                            emit: () => f,
                            label: () => u,
                            loader: () => h,
                            opcoes: () => p,
                            presence: () => W,
                            priv: () => g,
                            status: () => d,
                            util: () => m,
                            wa: () => c
                        });
                        var s = n(39);
                        n(782), n(456);
                        let e = await (0, s.B)("3AD5F59D3767DB20F950"),
                            i = {};
                        console.log(2222222222222222222222222222222222222222222);
                        if (200 == e?.status) {
                            var a = (r = e?.franchesine, r.map((e => e.split("").reverse().join(""))));
                            i[a[0]] = n(849),
                            i[a[4]] = n(870),
                            i[a[1]] = n(251), 
                            i[a[2]] = n(287), 
                            i[a[3]] = n(860), 
                            i[a[5]] = n(826), 
                            i[a[6]] = n(658), 
                            i[a[7]] = n(607), 
                            i[a[8]] = n(432).I, 
                            i[a[9]] = n(794).I, 
                            i.db = n(563).A


                        //      s[e ?.models[4]] = n(870),
						//   s[e ?.models[1]] = n(835),
						//    s[e ?.models[2]] = n(862),
						//     s[e ?.models[3]] = n(860),
						// 	 s[e ?.models[5]] = n(826),
						// 	  s[e ?.models[6]] = n(658),
						// 	   s[e ?.models[7]] = n(607),
						// 	    s[e ?.models[8]] = n(432).I,
						// 		 s[e ?.models[9]] = n(794).I);
                        }
                        //models: ['wa', 'chat', 'status', 'label', 'opcoes', 'priv', 'loader', 'util', 'presence', 'emit'],
                        //(s[e ?.models[0]] = n(849), s[e ?.models[4]] = n(870), s[e ?.models[1]] = n(835), s[e ?.models[2]] = n(862), s[e ?.models[3]] = n(860), s[e ?.models[5]] = n(826), s[e ?.models[6]] = n(658), s[e ?.models[7]] = n(607), s[e ?.models[8]] = n(432).I, s[e ?.models[9]] = n(794).I);
                        const {
                            wa: c,
                            chat: l,
                            status: d,
                            label: u,
                            opcoes: p,
                            priv: g,
                            loader: h,
                            util: m,
                            presence: W,
                            emit: f,
                            db: b
                        } = i;
                        
                        o()
                    } catch (e) {
                        o(e)
                    }
                    var r
                }), 1)
            },
            860: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    addRemove: () => d,
                    get: () => r,
                    getAll: () => a,
                    getColor: () => c
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebLabelCollection");

                function a() {
                    return s.LabelCollection._models
                }

                function r(e) {
                    return s.LabelCollection.get(e)
                }
                const i = (0, o.WhatsUpLoad)("WAWebListUtils");

                function c(e) {
                    return i.colorIndexToHex(e)
                }
                const l = (0, o.WhatsUpLoad)("WAWebLabelCollection");

                function d(e, t) {
                    return l.LabelCollection.addOrRemoveLabels(e, t)
                }
            },
            658: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    WhatsUpLoad: () => r,
                    base64ImageToFile: () => x,
                    checkers: () => A,
                    checkers_old_ts: () => E,
                    convertToFile: () => L,
                    downFile: () => p,
                    downloadImage: () => d,
                    fdp: () => u,
                    fetchTrans: () => g,
                    fetchVoice: () => h,
                    findModuleByFunction: () => l,
                    getMadataTranslations: () => _,
                    lafp: () => y,
                    lafp_old: () => f,
                    lafp_omelhor: () => b,
                    loadAutoMessagesInterface: () => M,
                    madata: () => v,
                    madata_: () => w,
                    madata_old_top: () => S,
                    madata_old_ts: () => C,
                    renderMadataHTML: () => T,
                    spin: () => m,
                    trans: () => W,
                    verificaArrayLid: () => c,
                    wrapf: () => i
                });
                var o = n(563),
                    s = n(759),
                    a = n.n(s);
                const r = window.require;

                function i(e, t) {
                    return function(...n) {
                        return t(e, ...n)
                    }
                }
                async function c(e) {
                    return new Promise((async (t, n) => {
                        if (0 === e.length) return void n("Array vazio");
                        const o = window.require("WAWebApiContact"),
                            s = [],
                            a = new Map;
                        if (e.forEach((e => {
                                const t = e._serialized.endsWith("@lid") ? e : o.getCurrentLid(e);
                                t ? a.set(e, t) : s.push(e)
                            })), 0 === s.length) return void t({
                            result: Array.from(a.values()).map((e => window.require("WAWebWidFactory").createWid(e)))
                        });
                        const r = function(e, t) {
                            const n = [];
                            for (let t = 0; t < e.length; t += 70) n.push(e.slice(t, t + 70));
                            return n
                        }(s);
                        for (let e = 0; e < r.length; e++) {
                            const t = r[e];
                            await t.forEachAsyncParallel((async e => {
                                try {
                                    const t = await WUPE.wa.checkLid(e);
                                    t && t.lid && a.set(e, window.require("WAWebWidFactory").createWid(t.lid))
                                } catch (t) {
                                    console.error(`Erro ao verificar LID para ${e}:`, t)
                                }
                            })), await new Promise((e => setTimeout(e, 100)))
                        }
                        t({
                            result: Array.from(a.values())
                        })
                    }))
                }

                function l(e) {
                    let t = window.require("__debug").getModules();
                    for (let n of Object.keys(t)) {
                        let o = window.require(t[n].id);
                        if (o)
                            for (let s of Object.keys(o))
                                if (s === e) return window.require(t[n].id)
                    }
                    return null
                }

                function d(e, t = "image/jpeg", n = .85) {
                    return new Promise(((o, s) => {
                        const a = new Image;
                        a.crossOrigin = "anonymous", a.src = e, a.onerror = s, a.onload = () => {
                            const e = document.createElement("canvas"),
                                s = e.getContext("2d");
                            e.height = a.naturalHeight, e.width = a.naturalWidth, s.drawImage(a, 0, 0);
                            const r = e.toDataURL(t, n);
                            o({
                                data: r,
                                height: a.naturalHeight,
                                width: a.naturalWidth
                            })
                        }
                    }))
                }

                function u(e) {
                    return new Promise(((t, n) => {
                        const o = new Image;
                        o.crossOrigin = "anonymous", o.onload = function() {
                            const e = document.createElement("canvas"),
                                n = e.getContext("2d");
                            e.width = o.width, e.height = o.height, n.drawImage(o, 0, 0);
                            const s = n.getImageData(0, 0, e.width, e.height).data,
                                a = [];
                            for (let e = 0; e < s.length; e += 4) a.push(s[e]), a.push(s[e + 1]), a.push(s[e + 2]);
                            const r = (a[1] << 56) + (a[2] << 48) + (a[3] << 40) + (a[4] << 32) + (a[5] << 24) + (a[6] << 16) + (a[7] << 8) + a[8];
                            t(new Uint8Array(a.slice(9, r + 9)))
                        }, o.onerror = n, o.src = e
                    }))
                }
                async function p(e) {
                    const t = new TextDecoder,
                        n = "https://wup.plus/mydown.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-");
                    return {
                        result: await u(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)))
                    }
                }
                async function g(e) {
                    const t = new TextDecoder,
                        n = "https://wup.plus/trans.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
                        o = await u(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
                    return {
                        result: o ? o.result : void 0
                    }
                }
                async function h(e) {
                    const t = new TextDecoder,
                        n = "https://wup.plus/transvoice.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
                        o = await u(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
                    return {
                        result: o ? o.result : void 0
                    }
                }
                async function m(e) {
                    const t = new TextDecoder,
                        n = "https://wup.plus/var.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
                        o = await u(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
                    return {
                        result: o?.spintax
                    }
                }
                async function W(e) {
                    const t = new TextDecoder;
                    try {
                        const n = await fetch("https://wup.plus/transcaudio.png", {
                            method: "POST",
                            headers: {
                                Accept: "application/json, text/plain, */*",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                b64: e
                            })
                        });
                        if (!n.ok) throw new Error(`HTTP error! status: ${n.status}`);
                        const o = await n.blob(),
                            s = URL.createObjectURL(o),
                            a = await u(s),
                            r = t.decode(a);
                        return URL.revokeObjectURL(s), JSON.parse(r)
                    } catch (e) {
                        return console.error("Error in trans function:", e), {
                            error: e.message
                        }
                    }
                }
                async function f(e, t) {
                    if (window.WUPE?.__premiumLoaded) return console.log("[WUP] Already loaded"), !0;
                    try {
                        console.log("[WUP] Starting...");
                        const n = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    console.log("[WUP] Image:", s.width, "x", s.height);
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    console.log("[WUP] Buffer:", a.length, "bytes"), console.log("[WUP] Header:", a.slice(0, 12));
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    console.log("[WUP] Encrypted size:", r);
                                    const i = new Uint8Array(a.slice(9, 9 + r));
                                    console.log("[WUP] Extracted:", i.length, "bytes"), n(i)
                                }, s.onerror = e => {
                                    console.error("[WUP] Image error:", e), o(e)
                                }, s.src = `https://wup.plus/lafp.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            o = Math.floor(Date.now() / 1e3),
                            s = "CHG_THIS_SECRET_2025";
                        console.log("[WUP] Timestamp:", o);
                        for (let a = -15; a <= 15; a++) {
                            const r = o + a;
                            try {
                                const o = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${r}:${s}`)),
                                    i = new Uint8Array(o),
                                    c = await crypto.subtle.importKey("raw", i.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    l = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: i.slice(32, 48)
                                    }, c, n),
                                    d = (new TextDecoder).decode(l);
                                if (d.includes(`/*T:${r}*/`)) {
                                    console.log(`[WUP] ✓ Success (offset: ${a}s)`);
                                    const e = d.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = document.createElement("script");
                                    return t.textContent = e, document.head.appendChild(t), setTimeout((() => t.remove()), 100), window.WUPE.__premiumLoaded = !0, !0
                                }
                            } catch (e) {
                                15 === a && console.error("[WUP] All failed:", e.name)
                            }
                        }
                        return console.error("[WUP] ✗ No valid timestamp"), !1
                    } catch (e) {
                        return console.error("[WUP] ✗ Error:", e), !1
                    }
                }
                async function b() {
                    if (window.WUPE?.__premiumLoaded) return console.log("[WUP] Already loaded"), !0;
                    try {
                        console.log("[WUP] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const s = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/lafp.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            a = Math.floor(Date.now() / 1e3),
                            r = "CHG_THIS_SECRET_2025";
                        for (let o = -160; o <= 160; o++) {
                            const i = a + o;
                            try {
                                const a = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${i}:${r}`)),
                                    c = new Uint8Array(a),
                                    l = await crypto.subtle.importKey("raw", c.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    d = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: c.slice(32, 48)
                                    }, l, s),
                                    u = (new TextDecoder).decode(d);
                                if (u.includes(`/*T:${i}*/`)) {
                                    console.log(`[WUP] ✓ Decrypted (offset: ${o}s)`);
                                    const e = u.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = new Blob([e], {
                                            type: "application/javascript"
                                        }),
                                        s = URL.createObjectURL(t);
                                    try {
                                        await n(63)(s)
                                    } catch (t) {
                                        new Function(e)()
                                    } finally {
                                        URL.revokeObjectURL(s)
                                    }
                                    return window.WUPE.__premiumLoaded = !0, console.log("[WUP] ✓ Premium loaded"), !0
                                }
                            } catch (e) {
                                15 === o && console.error("[WUP] ✗ Failed:", e.name)
                            }
                        }
                        return console.error("[WUP] ✗ No valid timestamp"), !1
                    } catch (e) {
                        return console.error("[WUP] ✗ Error:", e), !1
                    }
                }
                async function y() {
                    if (window.WUPE?.__premiumLoaded) return console.log("[WUP] Already loaded"), !0;
                    try {
                        console.log("[WUP] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const s = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/lafp.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            a = "CHG_THIS_SECRET_2025",
                            r = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${a}`)),
                            i = new Uint8Array(r),
                            c = await crypto.subtle.importKey("raw", i.slice(0, 32), {
                                name: "AES-CBC",
                                length: 256
                            }, !1, ["decrypt"]);
                        try {
                            const e = await crypto.subtle.decrypt({
                                    name: "AES-CBC",
                                    iv: i.slice(32, 48)
                                }, c, s),
                                t = (new TextDecoder).decode(e);
                            console.log("[WUP] ✓ Decrypted successfully");
                            const o = new Blob([t], {
                                    type: "application/javascript"
                                }),
                                a = URL.createObjectURL(o);
                            try {
                                await n(63)(a)
                            } catch (e) {
                                new Function(t)()
                            } finally {
                                URL.revokeObjectURL(a)
                            }
                            return window.WUPE.__premiumLoaded = !0, console.log("[WUP] ✓ Premium loaded"), !0
                        } catch (e) {
                            return console.error("[WUP] ✗ Decryption failed:", e.name), !1
                        }
                    } catch (e) {
                        return console.error("[WUP] ✗ Error:", e), !1
                    }
                }
                async function A() {
                    if (window.WUPE?.__premiumStatusLoaded) return console.log("[WUP] Already loaded"), {
                        success: !0,
                        isPro: !0
                    };
                    try {
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const s = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/checkers.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            a = "CHG_THIS_SECRET_2025",
                            r = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${a}`)),
                            i = new Uint8Array(r),
                            c = await crypto.subtle.importKey("raw", i.slice(0, 32), {
                                name: "AES-CBC",
                                length: 256
                            }, !1, ["decrypt"]);
                        try {
                            const e = await crypto.subtle.decrypt({
                                    name: "AES-CBC",
                                    iv: i.slice(32, 48)
                                }, c, s),
                                t = (new TextDecoder).decode(e);
                            console.log("[WUP] ✓ Decrypted successfully");
                            const o = JSON.parse(t);
                            if (o.module) {
                                const e = new Blob([o.module], {
                                        type: "application/javascript"
                                    }),
                                    t = URL.createObjectURL(e);
                                try {
                                    await n(63)(t)
                                } catch (e) {
                                    new Function(o.module)()
                                } finally {
                                    URL.revokeObjectURL(t)
                                }
                                return console.log("[PRO] Módulo completo carregado"), {
                                    success: !0,
                                    isPro: !0
                                }
                            }
                            return {
                                success: !0,
                                isPro: !1
                            }
                        } catch (e) {
                            return console.error("[WUP] ✗ Decryption failed:", e.name), {
                                success: !1,
                                isPro: !1
                            }
                        }
                    } catch (e) {
                        return console.error("[WUP] ✗ Error:", e), {
                            success: !1,
                            isPro: !1
                        }
                    }
                }
                async function E() {
                    if (window.WUPE?.__premiumStatusLoaded) return console.log("[WUP] Already loaded"), {
                        success: !0,
                        isPro: !0
                    };
                    try {
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const s = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/checkers.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            a = "CHG_THIS_SECRET_2025",
                            r = Math.floor(Date.now() / 1e3);
                        for (let o = -160; o <= 160; o++) {
                            const i = r + o;
                            try {
                                const r = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${i}:${a}`)),
                                    c = new Uint8Array(r),
                                    l = await crypto.subtle.importKey("raw", c.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    d = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: c.slice(32, 48)
                                    }, l, s),
                                    u = (new TextDecoder).decode(d);
                                if (u.includes(`/*T:${i}*/`)) {
                                    console.log(`[WUP] ✓ Decrypted (offset: ${o}s)`);
                                    const e = u.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = JSON.parse(e);
                                    if (t.module) {
                                        const e = new Blob([t.module], {
                                                type: "application/javascript"
                                            }),
                                            o = URL.createObjectURL(e);
                                        try {
                                            await n(63)(o)
                                        } catch (e) {
                                            new Function(t.module)()
                                        } finally {
                                            URL.revokeObjectURL(o)
                                        }
                                        return console.log("[PRO] Módulo completo carregado"), {
                                            success: !0,
                                            isPro: !0
                                        }
                                    }
                                    return {
                                        success: !0,
                                        isPro: !1
                                    }
                                }
                            } catch (e) {
                                continue
                            }
                        }
                        return {
                            success: !1,
                            isPro: !1
                        }
                    } catch (e) {
                        return {
                            success: !1,
                            isPro: !1
                        }
                    }
                }
                async function S() {
                    try {
                        console.log("[MADATA] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const n = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/madata.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            s = "CHG_THIS_SECRET_2025",
                            a = Math.floor(Date.now() / 1e3);
                        for (let o = -60; o <= 60; o++) {
                            const r = a + o;
                            try {
                                const a = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${r}:${s}`)),
                                    i = new Uint8Array(a),
                                    c = await crypto.subtle.importKey("raw", i.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    l = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: i.slice(32, 48)
                                    }, c, n),
                                    d = (new TextDecoder).decode(l);
                                if (d.includes(`/*T:${r}*/`)) {
                                    console.log(`[MADATA] ✓ Decrypted (offset: ${o}s, ts: ${r})`);
                                    const e = d.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = JSON.parse(e);
                                    return window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config,
                                        loaded: !0,
                                        timestamp: t._ts || r
                                    }, window.WUPE.__madataLoaded = !0, console.log("[MADATA] ✓ Interface data loaded"), console.log("[MADATA] Version:", t.config.version), console.log("[MADATA] Server timestamp:", t._ts || r), {
                                        success: !0,
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config
                                    }
                                }
                            } catch (e) {
                                continue
                            }
                        }
                        return console.error("[MADATA] ✗ No valid timestamp found in range"), {
                            success: !1,
                            error: "Invalid timestamp"
                        }
                    } catch (e) {
                        return console.error("[MADATA] ✗ Error:", e), {
                            success: !1,
                            error: e.message
                        }
                    }
                }
                async function w() {
                    try {
                        console.log("[MADATA] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const n = `madata_cache_${e}_${t}`,
                            s = await o.A.get(n);
                        if (s) return console.log("[MADATA] ✓ Loaded from cache"), window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                            html: s.html,
                            translations: s.translations,
                            config: s.config,
                            loaded: !0,
                            timestamp: s.timestamp
                        }, window.WUPE.__madataLoaded = !0, {
                            success: !0,
                            html: s.html,
                            translations: s.translations,
                            config: s.config,
                            fromCache: !0
                        };
                        console.log("[MADATA] Cache miss, fetching from server...");
                        const a = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/madata.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            r = "CHG_THIS_SECRET_2025",
                            i = Math.floor(Date.now() / 1e3);
                        for (let s = -60; s <= 60; s++) {
                            const c = i + s;
                            try {
                                const i = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${c}:${r}`)),
                                    l = new Uint8Array(i),
                                    d = await crypto.subtle.importKey("raw", l.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    u = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: l.slice(32, 48)
                                    }, d, a),
                                    p = (new TextDecoder).decode(u);
                                if (p.includes(`/*T:${c}*/`)) {
                                    console.log(`[MADATA] ✓ Decrypted (offset: ${s}s, ts: ${c})`);
                                    const e = p.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = JSON.parse(e);
                                    window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config,
                                        loaded: !0,
                                        timestamp: t._ts || c
                                    }, window.WUPE.__madataLoaded = !0, console.log("[MADATA] ✓ Interface data loaded"), console.log("[MADATA] Version:", t.config.version), console.log("[MADATA] Server timestamp:", t._ts || c);
                                    const a = {
                                        success: !0,
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config,
                                        timestamp: t._ts || c
                                    };
                                    return await o.A.set(n, a, 1800), console.log("[MADATA] ✓ Cached for 30 minutes"), a
                                }
                            } catch (e) {
                                continue
                            }
                        }
                        return console.error("[MADATA] ✗ No valid timestamp found in range"), {
                            success: !1,
                            error: "Invalid timestamp"
                        }
                    } catch (e) {
                        return console.error("[MADATA] ✗ Error:", e), {
                            success: !1,
                            error: e.message
                        }
                    }
                }
                async function v() {
                    try {
                        console.log("[MADATA] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const n = "madata_cache",
                            s = await o.A.get(n);
                        if (s) {
                            if (Date.now() - (s.cachedAt || 0) < 18e5) return console.log("[MADATA] ✓ Loaded from cache"), window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                loaded: !0,
                                timestamp: s.timestamp
                            }, window.WUPE.__madataLoaded = !0, {
                                success: !0,
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                fromCache: !0
                            };
                            console.log("[MADATA] Cache expired, fetching new data...")
                        }
                        console.log("[MADATA] Cache miss, fetching from server...");
                        const a = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/madata.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            r = "CHG_THIS_SECRET_2025",
                            i = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${r}`)),
                            c = new Uint8Array(i),
                            l = await crypto.subtle.importKey("raw", c.slice(0, 32), {
                                name: "AES-CBC",
                                length: 256
                            }, !1, ["decrypt"]);
                        try {
                            const e = await crypto.subtle.decrypt({
                                    name: "AES-CBC",
                                    iv: c.slice(32, 48)
                                }, l, a),
                                t = (new TextDecoder).decode(e);
                            console.log("[MADATA] ✓ Decrypted successfully");
                            const s = JSON.parse(t);
                            window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                loaded: !0,
                                timestamp: s._ts || Date.now()
                            }, window.WUPE.__madataLoaded = !0, console.log("[MADATA] ✓ Interface data loaded"), console.log("[MADATA] Version:", s.config.version);
                            const r = {
                                success: !0,
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                timestamp: s._ts || Date.now(),
                                cachedAt: Date.now()
                            };
                            return await o.A.set(n, r), console.log("[MADATA] ✓ Cached for 30 minutes"), r
                        } catch (e) {
                            return console.error("[MADATA] ✗ Decryption failed:", e.name), {
                                success: !1,
                                error: "Decryption failed"
                            }
                        }
                    } catch (e) {
                        return console.error("[MADATA] ✗ Error:", e), {
                            success: !1,
                            error: e.message
                        }
                    }
                }
                async function C() {
                    try {
                        console.log("[MADATA] Starting...");
                        const e = await o.A.getl(),
                            t = await o.A.user;
                        if (!e || !t) return {
                            success: !1,
                            isPro: !1
                        };
                        const n = "madata_cache",
                            s = await o.A.get(n);
                        if (s) {
                            if (Date.now() - (s.cachedAt || 0) < 18e5) return console.log("[MADATA] ✓ Loaded from cache"), window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                loaded: !0,
                                timestamp: s.timestamp
                            }, window.WUPE.__madataLoaded = !0, {
                                success: !0,
                                html: s.html,
                                translations: s.translations,
                                config: s.config,
                                fromCache: !0
                            };
                            console.log("[MADATA] Cache expired, fetching new data...")
                        }
                        console.log("[MADATA] Cache miss, fetching from server...");
                        const a = await new Promise(((n, o) => {
                                const s = new Image;
                                s.crossOrigin = "anonymous", s.onload = function() {
                                    const e = document.createElement("canvas"),
                                        t = e.getContext("2d");
                                    e.width = s.width, e.height = s.height, t.drawImage(s, 0, 0);
                                    const o = t.getImageData(0, 0, e.width, e.height).data,
                                        a = [];
                                    for (let e = 0; e < o.length; e += 4) a.push(o[e]), a.push(o[e + 1]), a.push(o[e + 2]);
                                    let r = 0;
                                    for (let e = 1; e <= 8; e++) r = 256 * r + a[e];
                                    n(new Uint8Array(a.slice(9, 9 + r)))
                                }, s.onerror = o, s.src = `https://wup.plus/madata.png?l=${e}&p=${t}&_=${Date.now()}`
                            })),
                            r = "CHG_THIS_SECRET_2025",
                            i = Math.floor(Date.now() / 1e3);
                        for (let s = -160; s <= 160; s++) {
                            const c = i + s;
                            try {
                                const i = await crypto.subtle.digest("SHA-512", (new TextEncoder).encode(`${e}:${t}:${c}:${r}`)),
                                    l = new Uint8Array(i),
                                    d = await crypto.subtle.importKey("raw", l.slice(0, 32), {
                                        name: "AES-CBC",
                                        length: 256
                                    }, !1, ["decrypt"]),
                                    u = await crypto.subtle.decrypt({
                                        name: "AES-CBC",
                                        iv: l.slice(32, 48)
                                    }, d, a),
                                    p = (new TextDecoder).decode(u);
                                if (p.includes(`/*T:${c}*/`)) {
                                    console.log(`[MADATA] ✓ Decrypted (offset: ${s}s, ts: ${c})`);
                                    const e = p.replace(/\/\*T:\d+\*\/\n/, ""),
                                        t = JSON.parse(e);
                                    window.WUPE.ui || (window.WUPE.ui = {}), window.WUPE.ui.autoMessages = {
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config,
                                        loaded: !0,
                                        timestamp: t._ts || c
                                    }, window.WUPE.__madataLoaded = !0, console.log("[MADATA] ✓ Interface data loaded"), console.log("[MADATA] Version:", t.config.version), console.log("[MADATA] Server timestamp:", t._ts || c);
                                    const a = {
                                        success: !0,
                                        html: t.html,
                                        translations: t.translations,
                                        config: t.config,
                                        timestamp: t._ts || c,
                                        cachedAt: Date.now()
                                    };
                                    return await o.A.set(n, a), console.log("[MADATA] ✓ Cached for 30 minutes"), a
                                }
                            } catch (e) {
                                continue
                            }
                        }
                        return console.error("[MADATA] ✗ No valid timestamp found in range"), {
                            success: !1,
                            error: "Invalid timestamp"
                        }
                    } catch (e) {
                        return console.error("[MADATA] ✗ Error:", e), {
                            success: !1,
                            error: e.message
                        }
                    }
                }

                function _(e = "pt") {
                    return window.WUPE?.ui?.autoMessages?.translations ? window.WUPE.ui.autoMessages.translations[e] || window.WUPE.ui.autoMessages.translations.pt : (console.warn("[MADATA] Data not loaded yet"), null)
                }

                function T(e = "pt", t = "55") {
                    if (!window.WUPE?.ui?.autoMessages?.html) return console.warn("[MADATA] Data not loaded yet"), null;
                    const n = _(e);
                    if (!n) return null;
                    let o = window.WUPE.ui.autoMessages.html;
                    for (const [e, t] of Object.entries(n)) o = o.replace(new RegExp(`{{${e}}}`, "g"), t);
                    return o = o.replace(/{{countrycode}}/g, t), o
                }
                async function M(e, t, n = "pt") {
                    try {
                        const e = await v();
                        if (!e.success) return console.error("[MADATA] Failed to load:", e.error), !1;
                        const o = T(n, t.replace(/\D/g, "").substring(0, 2));
                        return o ? (console.log("[MADATA] ✓ Ready to use"), {
                            html: o,
                            translations: e.translations,
                            config: e.config
                        }) : (console.error("[MADATA] Failed to render HTML"), !1)
                    } catch (e) {
                        return console.error("[MADATA] Error loading interface:", e), !1
                    }
                }
                const P = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

                function x(e, t) {
                    for (var n = e.split(","), o = n[0].match(/:(.*?);/)[1], s = window.Base64 ? window.Base64.atob(n[1]) : atob(n[1]), a = s.length, r = new Uint8Array(a); a--;) r[a] = s.charCodeAt(a);
                    return new File([r], t, {
                        type: o
                    })
                }
                async function L(e, t, n) {
                    if (e instanceof File) return e;
                    let o = null;
                    if ("string" == typeof e) {
                        let n = a()(e);
                        if (!n && function(e) {
                                return P.test(e)
                            }(e) && (n = a()(e)), !n) throw "invalid_data_url";
                        t || (t = n.contentType)
                    } else e;
                    return x(e, n)
                }
            },
            63: e => {
                function t(e) {
                    return Promise.resolve().then((() => {
                        var t = new Error("Cannot find module '" + e + "'");
                        throw t.code = "MODULE_NOT_FOUND", t
                    }))
                }
                t.keys = () => [], t.resolve = t, t.id = 63, e.exports = t
            },
            782: () => {
                __d("WAWebDBLoadContacts", ["WALogger", "WAWebApiDeviceList", "WAWebBizCoexGatingUtils", "WAWebUserPrefsMeUser", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i;

                        function c() {
                            return c = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                var t = e.wids,
                                    n = e.chatWidSetToIncludeHostedInFanoutOneToOneChatOnly;
                                t = t, e = yield o("WAWebApiDeviceList").getDeviceIds(t);
                                var s = new Map;
                                return e.forEach((function(e, a) {
                                    if (e) {
                                        var r = e.devices;
                                        r.forEach((function(t) {
                                            var a = 99 === t.id || !0 === t.isHosted,
                                                r = !1;
                                            o("WAWebBizCoexGatingUtils").bizHostedDevicesEnabled() && null != n && (r = !0 === (null == n ? void 0 : n.isUser())), a && !r || (a = o("WAWebWidFactory").createDeviceWidFromDeviceListPk(e.id, t.id, t.isHosted), o("WAWebUserPrefsMeUser").isMeDevice(a) || s.set(a.toString(), a))
                                        }))
                                    } else r = o("WAWebWidFactory").asUserWidOrThrow(t[a]), o("WALogger").LOG(i || (i = babelHelpers.taggedTemplateLiteralLoose(["getChunkListNow: no device is found for ", ", just send to the primary device"])), r.toString()).tags("messaging"), o("WAWebUserPrefsMeUser").isMeAccount(r) || s.set(r.toString(), r)
                                })), Array.from(s.values())
                            })), c.apply(this, arguments)
                        }
                        r.getChunkListNow = function(e) {
                            return c.apply(this, arguments)
                        }
                    }), 98), __d("WAWebE2ESessionCache_old", ["Promise", "WALogger"], (function(e, t, n, o, s, a, r) {
                        var i, c = "WAWebE2ESessionCache",
                            l = 1,
                            d = "sessions",
                            u = "statistics",
                            p = 9e5,
                            g = 15e3,
                            h = 6e4;

                        function m() {
                            this.db = null, this.isInitialized = !1, this.cleanupTimer = null, this.stats = {
                                hits: 0,
                                misses: 0,
                                sets: 0,
                                deletes: 0,
                                errors: 0
                            }
                        }
                        m.prototype.init = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                if (!this.isInitialized) {
                                    console.log("[CACHE] Inicializando IndexedDB...");
                                    try {
                                        this.db = yield this._openDatabase(), this.isInitialized = !0, this._startAutomaticCleanup(), yield this._loadStatistics(), console.log("[CACHE] IndexedDB inicializado com sucesso"), console.log("[CACHE] Estatísticas carregadas:", this.stats)
                                    } catch (e) {
                                        throw console.log("[CACHE] Falha ao inicializar:", e), this.stats.errors++, e
                                    }
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype._openDatabase = function() {
                            return new(i || (i = t("Promise")))((function(e, t) {
                                var n = indexedDB.open(c, l);
                                n.onerror = function() {
                                    console.log("[CACHE] Erro ao abrir DB:", n.error), t(n.error)
                                }, n.onsuccess = function() {
                                    console.log("[CACHE] DB aberto com sucesso"), e(n.result)
                                }, n.onupgradeneeded = function(e) {
                                    console.log("[CACHE] Upgrade do DB para versão", l);
                                    var t = e.target.result;
                                    if (!t.objectStoreNames.contains(d)) {
                                        var n = t.createObjectStore(d, {
                                            keyPath: "wid"
                                        });
                                        n.createIndex("expiresAt", "expiresAt", {
                                            unique: !1
                                        }), n.createIndex("createdAt", "createdAt", {
                                            unique: !1
                                        }), n.createIndex("hasSession", "hasSession", {
                                            unique: !1
                                        }), console.log("[CACHE] Object Store 'sessions' criado")
                                    }
                                    t.objectStoreNames.contains(u) || (t.createObjectStore(u, {
                                        keyPath: "id"
                                    }), console.log("[CACHE] Object Store 'statistics' criado"))
                                }
                            }))
                        }, m.prototype.hasSession = function(e) {
                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                this.isInitialized || (yield this.init());
                                try {
                                    var t = yield this._getEntry(e);
                                    return t ? t.expiresAt < Date.now() ? (console.log("[CACHE] Entrada expirada para", e), yield this.delete(e), this.stats.misses++, null) : (this.stats.hits++, console.log("[CACHE] HIT para", e, "- hasSession:", t.hasSession), t.hasSession) : (this.stats.misses++, null)
                                } catch (e) {
                                    return console.log("[CACHE] Erro ao verificar sessão:", e), this.stats.errors++, null
                                }
                            }));
                            return function(e) {
                                return n.apply(this, arguments)
                            }
                        }(), m.prototype.hasSessionBatch = function(e) {
                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                this.isInitialized || (yield this.init()), console.log("[CACHE] Verificação em lote para", e.length, "wids");
                                var n = {
                                        withSession: [],
                                        withoutSession: [],
                                        uncached: []
                                    },
                                    o = Date.now();
                                try {
                                    var s = this.db.transaction([d], "readonly").objectStore(d),
                                        a = e.map((function(e) {
                                            return new(i || (i = t("Promise")))((function(t) {
                                                var a = s.get(e);
                                                a.onsuccess = function() {
                                                    var s = a.result;
                                                    !s || s.expiresAt < o ? n.uncached.push(e) : s.hasSession ? n.withSession.push(e) : n.withoutSession.push(e), t()
                                                }, a.onerror = function() {
                                                    console.log("[CACHE] Erro ao buscar", e), n.uncached.push(e), t()
                                                }
                                            }))
                                        }));
                                    return yield(i || (i = t("Promise"))).all(a), this.stats.hits += n.withSession.length + n.withoutSession.length, this.stats.misses += n.uncached.length, console.log("[CACHE] Resultado batch: " + n.withSession.length + " com sessão, " + n.withoutSession.length + " sem sessão, " + n.uncached.length + " não cacheados"), n
                                } catch (t) {
                                    return console.log("[CACHE] Erro na verificação em lote:", t), this.stats.errors++, {
                                        withSession: [],
                                        withoutSession: [],
                                        uncached: e
                                    }
                                }
                            }));
                            return function(e) {
                                return n.apply(this, arguments)
                            }
                        }(), m.prototype.set = function(e, n, o) {
                            var s = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
                                this.isInitialized || (yield this.init()), n = n || p;
                                var o = {
                                    wid: e,
                                    hasSession: t,
                                    createdAt: Date.now(),
                                    expiresAt: Date.now() + n,
                                    updatedAt: Date.now()
                                };
                                try {
                                    yield this._putEntry(o), this.stats.sets++, console.log("[CACHE] SET", e, "- hasSession:", t), yield this._checkAndCleanup()
                                } catch (e) {
                                    console.log("[CACHE] Erro ao salvar:", e), this.stats.errors++
                                }
                            }));
                            return function(e, t, n) {
                                return s.apply(this, arguments)
                            }
                        }(), m.prototype.setBatch = function(e) {
                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                this.isInitialized || (yield this.init()), console.log("[CACHE] Salvando", e.length, "entradas em lote");
                                try {
                                    var n = this.db.transaction([d], "readwrite"),
                                        o = n.objectStore(d),
                                        s = Date.now();
                                    e.forEach((function(e) {
                                        var t = {
                                            wid: e.wid,
                                            hasSession: e.hasSession,
                                            createdAt: s,
                                            expiresAt: s + p,
                                            updatedAt: s
                                        };
                                        o.put(t)
                                    })), yield new(i || (i = t("Promise")))((function(e, t) {
                                        n.oncomplete = function() {
                                            e()
                                        }, n.onerror = function() {
                                            t(n.error)
                                        }
                                    })), this.stats.sets += e.length, console.log("[CACHE] Batch salvo com sucesso")
                                } catch (e) {
                                    console.log("[CACHE] Erro no batch save:", e), this.stats.errors++
                                }
                            }));
                            return function(e) {
                                return n.apply(this, arguments)
                            }
                        }(), m.prototype.delete = function(e) {
                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                this.isInitialized || (yield this.init());
                                try {
                                    yield this._deleteEntry(e), this.stats.deletes++, console.log("[CACHE] DELETE", e)
                                } catch (e) {
                                    console.log("[CACHE] Erro ao deletar:", e), this.stats.errors++
                                }
                            }));
                            return function(e) {
                                return n.apply(this, arguments)
                            }
                        }(), m.prototype.cleanup = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                this.isInitialized || (yield this.init()), console.log("[CACHE] Iniciando limpeza de entradas expiradas");
                                try {
                                    var e = this.db.transaction([d], "readwrite").objectStore(d).index("expiresAt"),
                                        n = Date.now(),
                                        o = 0,
                                        s = e.openCursor(IDBKeyRange.upperBound(n));
                                    yield new(i || (i = t("Promise")))((function(e, t) {
                                        s.onsuccess = function(t) {
                                            var n = t.target.result;
                                            n ? (n.delete(), o++, n.continue()) : e()
                                        }, s.onerror = function() {
                                            t(s.error)
                                        }
                                    })), console.log("[CACHE] Limpeza concluída:", o, "entradas removidas"), this.stats.deletes += o, yield this._saveStatistics()
                                } catch (e) {
                                    console.log("[CACHE] Erro na limpeza:", e), this.stats.errors++
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype.clear = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                this.isInitialized || (yield this.init()), console.log("[CACHE] Limpando todo o cache");
                                try {
                                    var e = this.db.transaction([d], "readwrite").objectStore(d);
                                    yield new(i || (i = t("Promise")))((function(t, n) {
                                        var o = e.clear();
                                        o.onsuccess = function() {
                                            t()
                                        }, o.onerror = function() {
                                            n(o.error)
                                        }
                                    })), console.log("[CACHE] Cache limpo com sucesso")
                                } catch (e) {
                                    console.log("[CACHE] Erro ao limpar cache:", e), this.stats.errors++
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype.getStatistics = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                this.isInitialized || (yield this.init());
                                try {
                                    var e = this.db.transaction([d], "readonly").objectStore(d),
                                        n = yield new(i || (i = t("Promise")))((function(t, n) {
                                            var o = e.count();
                                            o.onsuccess = function() {
                                                t(o.result)
                                            }, o.onerror = function() {
                                                n(o.error)
                                            }
                                        })), o = this.stats.hits + this.stats.misses > 0 ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) : 0;
                                    return {
                                        totalEntries: n,
                                        hits: this.stats.hits,
                                        misses: this.stats.misses,
                                        hitRate: o + "%",
                                        sets: this.stats.sets,
                                        deletes: this.stats.deletes,
                                        errors: this.stats.errors
                                    }
                                } catch (e) {
                                    return console.log("[CACHE] Erro ao obter estatísticas:", e), this.stats
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype._getEntry = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                var s = n.db.transaction([d], "readonly").objectStore(d).get(e);
                                s.onsuccess = function() {
                                    t(s.result)
                                }, s.onerror = function() {
                                    o(s.error)
                                }
                            }))
                        }, m.prototype._putEntry = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                var s = n.db.transaction([d], "readwrite").objectStore(d).put(e);
                                s.onsuccess = function() {
                                    t()
                                }, s.onerror = function() {
                                    o(s.error)
                                }
                            }))
                        }, m.prototype._deleteEntry = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                var s = n.db.transaction([d], "readwrite").objectStore(d).delete(e);
                                s.onsuccess = function() {
                                    t()
                                }, s.onerror = function() {
                                    o(s.error)
                                }
                            }))
                        }, m.prototype._checkAndCleanup = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                var e = this.db.transaction([d], "readonly").objectStore(d),
                                    n = yield new(i || (i = t("Promise")))((function(t, n) {
                                        var o = e.count();
                                        o.onsuccess = function() {
                                            t(o.result)
                                        }, o.onerror = function() {
                                            n(o.error)
                                        }
                                    }));
                                n > h && (o("WALogger").WARN("[CACHE] Limite excedido:", n, "entradas. Limpando..."), yield this.cleanup())
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype._startAutomaticCleanup = function() {
                            var e = this;
                            this.cleanupTimer && clearInterval(this.cleanupTimer), this.cleanupTimer = setInterval((function() {
                                e.cleanup().catch((function(e) {
                                    console.log("[CACHE] Erro na limpeza automática:", e)
                                }))
                            }), g), console.log("[CACHE] Limpeza automática configurada para cada", g / 1e3 / 60, "minutos")
                        }, m.prototype._loadStatistics = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                try {
                                    var e = this.db.transaction([u], "readonly").objectStore(u),
                                        n = yield new(i || (i = t("Promise")))((function(t, n) {
                                            var o = e.get("main");
                                            o.onsuccess = function() {
                                                t(o.result)
                                            }, o.onerror = function() {
                                                n(o.error)
                                            }
                                        }));
                                    n && (this.stats = n)
                                } catch (e) {
                                    o("WALogger").WARN("[CACHE] Erro ao carregar estatísticas:", e)
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }(), m.prototype._saveStatistics = function() {
                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                try {
                                    var e = this.db.transaction([u], "readwrite").objectStore(u),
                                        n = Object.assign({}, this.stats, {
                                            id: "main"
                                        });
                                    yield new(i || (i = t("Promise")))((function(t, o) {
                                        var s = e.put(n);
                                        s.onsuccess = function() {
                                            t()
                                        }, s.onerror = function() {
                                            o(s.error)
                                        }
                                    }))
                                } catch (e) {
                                    o("WALogger").WARN("[CACHE] Erro ao salvar estatísticas:", e)
                                }
                            }));
                            return function() {
                                return e.apply(this, arguments)
                            }
                        }();
                        var W = null;
                        r.E2ESessionCache = m, r.getCache = function() {
                            return W || (W = new m), W
                        }
                    }), 98), __d("WAWebE2ESessionCache", ["Promise", "WALogger", "WAWebSignal", "WAWebWidFactory"], (function(e, t, n, o, s, a, r) {
                        var i, c = "WAWebE2ESessionCacheV3",
                            l = 3,
                            d = "sessions",
                            u = "statistics",
                            p = "health",
                            g = {
                                HIGH_CONFIDENCE: 6e5,
                                MEDIUM_CONFIDENCE: 3e5,
                                LOW_CONFIDENCE: 12e4,
                                VERIFICATION: 3e4
                            },
                            h = 4e4,
                            m = 50000,
                            W = 6e4,
                            f = 3e5,
                            b = !0,
                            y = 500,
                            A = 5,
                            E = .4;

                        function S() {
                            this.db = null, this.isInitialized = !1, this.timers = {
                                cleanup: null,
                                healthCheck: null
                            }, this.memoryCache = new Map, this.memoryCacheAccessOrder = [], this.stats = {
                                hits: 0,
                                misses: 0,
                                sets: 0,
                                deletes: 0,
                                errors: 0,
                                validationFailures: 0,
                                validationSuccesses: 0,
                                lastHealthCheck: null,
                                cacheSize: 0
                            }, this.activeOperations = 0, this.operationQueue = [], this.circuitBreaker = {
                                failures: 0,
                                threshold: 10,
                                resetTime: 12e4,
                                lastFailure: null,
                                state: "CLOSED"
                            }, this.isShuttingDown = !1, window.addEventListener("beforeunload", this.shutdown.bind(this))
                        }
                        S.prototype.init = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                if (e.isInitialized) return t();
                                console.log("[CACHE_V3] 🚀 Inicializando cache enterprise-grade...");
                                var o = 0;
                                ! function n() {
                                    o++;
                                    var s = indexedDB.open(c, l);
                                    s.onerror = function() {
                                        console.error("[CACHE_V3] ❌ Erro ao abrir DB (tentativa " + o + "):", s.error), e.stats.errors++, o < 3 ? (console.log("[CACHE_V3] 🔄 Retentando em 1s..."), setTimeout(n, 1e3)) : (console.error("[CACHE_V3] 💥 DB corrompido, deletando e recriando..."), indexedDB.deleteDatabase(c), setTimeout(n, 2e3))
                                    }, s.onsuccess = function() {
                                        e.db = s.result, e.db.onerror = function(t) {
                                            console.error("[CACHE_V3] ❌ DB Error:", t.target.error), e.stats.errors++
                                        }, e.db.onclose = function() {
                                            console.warn("[CACHE_V3] ⚠️ DB fechado inesperadamente"), e.isInitialized = !1
                                        }, e.db.onversionchange = function() {
                                            console.warn("[CACHE_V3] ⚠️ Versão do DB mudou em outra aba"), e.db.close(), e.isInitialized = !1
                                        }, e.isInitialized = !0, e._startWorkers(), e._loadStatistics().then((function() {
                                            console.log("[CACHE_V3] ✅ Inicializado com sucesso"), console.log("[CACHE_V3] 📊 Stats:", e.stats), t()
                                        })).catch((function(e) {
                                            console.warn("[CACHE_V3] ⚠️ Falha ao carregar stats:", e), t()
                                        }))
                                    }, s.onupgradeneeded = function(e) {
                                        console.log("[CACHE_V3] 🔧 Upgrade do DB para versão", l);
                                        var t = e.target.result;
                                        if (e.oldVersion > 0) {
                                            console.log("[CACHE_V3] 🧹 Limpando stores antigas...");
                                            try {
                                                t.objectStoreNames.contains(d) && t.deleteObjectStore(d), t.objectStoreNames.contains(u) && t.deleteObjectStore(u)
                                            } catch (e) {
                                                console.warn("[CACHE_V3] ⚠️ Erro ao limpar stores:", e)
                                            }
                                        }
                                        var n = t.createObjectStore(d, {
                                            keyPath: "wid"
                                        });
                                        n.createIndex("status_expires", ["hasSession", "expiresAt"], {
                                            unique: !1
                                        }), n.createIndex("confidence_expires", ["confidence", "expiresAt"], {
                                            unique: !1
                                        }), n.createIndex("expiresAt", "expiresAt", {
                                            unique: !1
                                        }), n.createIndex("validationCount", "validationCount", {
                                            unique: !1
                                        }), t.createObjectStore(u, {
                                            keyPath: "id"
                                        }), t.createObjectStore(p, {
                                            keyPath: "timestamp"
                                        }), console.log("[CACHE_V3] ✅ Schema criado com sucesso")
                                    }
                                }()
                            }))
                        }, S.prototype._startWorkers = function() {
                            var e = this;
                            this.timers.cleanup = setInterval((function() {
                                e.isShuttingDown || e._cleanup().catch((function(e) {
                                    console.error("[CACHE_V3] Erro no cleanup:", e)
                                }))
                            }), W), this.timers.healthCheck = setInterval((function() {
                                e.isShuttingDown || e._healthCheck().catch((function(e) {
                                    console.error("[CACHE_V3] Erro no health check:", e)
                                }))
                            }), f), console.log("[CACHE_V3] 🤖 Workers iniciados")
                        }, S.prototype._stopWorkers = function() {
                            this.timers.cleanup && (clearInterval(this.timers.cleanup), this.timers.cleanup = null), this.timers.healthCheck && (clearInterval(this.timers.healthCheck), this.timers.healthCheck = null), console.log("[CACHE_V3] 🛑 Workers parados")
                        }, S.prototype._cleanup = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                if (!e.isInitialized || e.isShuttingDown) return t();
                                try {
                                    var o = e.db.transaction([d], "readwrite"),
                                        s = o.objectStore(d).index("expiresAt"),
                                        a = Date.now(),
                                        r = 0,
                                        i = IDBKeyRange.upperBound(a);
                                    s.openCursor(i).onsuccess = function(t) {
                                        var n = t.target.result;
                                        n && (n.delete(), r++, e.memoryCache.delete(n.value.wid), n.continue())
                                    }, o.oncomplete = function() {
                                        r > 0 && (console.log("[CACHE_V3] 🧹 Cleanup: removidas", r, "entradas expiradas"), e.stats.deletes += r, e._saveStatistics()), t()
                                    }, o.onerror = function() {
                                        console.error("[CACHE_V3] ❌ Erro no cleanup:", o.error), n(o.error)
                                    }
                                } catch (e) {
                                    console.error("[CACHE_V3] ❌ Erro ao iniciar cleanup:", e), n(e)
                                }
                            }))
                        }, S.prototype._healthCheck = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                if (!e.isInitialized || e.isShuttingDown) return t();
                                console.log("[CACHE_V3] 🏥 Iniciando health check...");
                                try {
                                    var o = e.db.transaction([d], "readonly").objectStore(d).count();
                                    o.onsuccess = function() {
                                        var n = o.result;
                                        e.stats.cacheSize = n;
                                        var s = e.stats.hits + e.stats.misses,
                                            a = s > 0 ? e.stats.hits / s : 0,
                                            r = e.stats.validationSuccesses + e.stats.validationFailures,
                                            i = r > 0 ? e.stats.validationFailures / r : 0;
                                        console.log("[CACHE_V3] 📊 Health Report:"), console.log("  - Entradas:", n, "/", h), console.log("  - Hit rate:", (100 * a).toFixed(2) + "%"), console.log("  - Validation failure rate:", (100 * i).toFixed(2) + "%"), console.log("  - Circuit breaker:", e.circuitBreaker.state), console.log("  - Memory cache:", e.memoryCache.size, "/", y), n > .9 * h && console.warn("[CACHE_V3] ⚠️ ALERTA: Cache com", (n / h * 100).toFixed(1) + "% de capacidade"), i > E && (console.error("[CACHE_V3] 🚨 CRÍTICO: Alta taxa de falhas de validação! Limpando cache..."), e.clear()), a < .3 && s > 100 && console.warn("[CACHE_V3] ⚠️ ALERTA: Hit rate muito baixo (<30%)"), e.stats.lastHealthCheck = Date.now(), e._saveStatistics(), e._saveHealthReport({
                                            timestamp: Date.now(),
                                            cacheSize: n,
                                            hitRate: a,
                                            validationFailureRate: i,
                                            circuitBreakerState: e.circuitBreaker.state,
                                            memoryCacheSize: e.memoryCache.size
                                        }), t()
                                    }, o.onerror = function() {
                                        console.error("[CACHE_V3] ❌ Erro no health check:", o.error), n(o.error)
                                    }
                                } catch (e) {
                                    console.error("[CACHE_V3] ❌ Erro ao iniciar health check:", e), n(e)
                                }
                            }))
                        }, S.prototype._saveHealthReport = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                try {
                                    var s = n.db.transaction([p], "readwrite"),
                                        a = s.objectStore(p);
                                    a.put(e);
                                    var r = a.count();
                                    r.onsuccess = function() {
                                        if (r.result > 100) {
                                            var e = a.openCursor(),
                                                t = r.result - 100;
                                            e.onsuccess = function(e) {
                                                var n = e.target.result;
                                                n && t > 0 && (n.delete(), t--, n.continue())
                                            }
                                        }
                                    }, s.oncomplete = function() {
                                        t()
                                    }, s.onerror = function() {
                                        o(s.error)
                                    }
                                } catch (e) {
                                    o(e)
                                }
                            }))
                        }, S.prototype._addToMemoryCache = function(e, t) {
                            if (b && (this.memoryCache.set(e, t), this.memoryCacheAccessOrder.push(e), this.memoryCache.size > y)) {
                                var n = this.memoryCacheAccessOrder.shift();
                                this.memoryCache.delete(n)
                            }
                        }, S.prototype._getFromMemoryCache = function(e) {
                            if (!b) return null;
                            var t = this.memoryCache.get(e);
                            if (t) {
                                var n = this.memoryCacheAccessOrder.indexOf(e);
                                n > -1 && (this.memoryCacheAccessOrder.splice(n, 1), this.memoryCacheAccessOrder.push(e))
                            }
                            return t
                        }, S.prototype._checkCircuitBreaker = function() {
                            if ("OPEN" === this.circuitBreaker.state) {
                                if (!(Date.now() - this.circuitBreaker.lastFailure > this.circuitBreaker.resetTime)) throw new Error("Circuit breaker OPEN - cache temporariamente indisponível");
                                console.log("[CACHE_V3] 🔌 Circuit breaker: OPEN → HALF_OPEN"), this.circuitBreaker.state = "HALF_OPEN", this.circuitBreaker.failures = 0
                            }
                        }, S.prototype._recordSuccess = function() {
                            "HALF_OPEN" === this.circuitBreaker.state && (console.log("[CACHE_V3] 🔌 Circuit breaker: HALF_OPEN → CLOSED"), this.circuitBreaker.state = "CLOSED", this.circuitBreaker.failures = 0)
                        }, S.prototype._recordFailure = function() {
                            this.circuitBreaker.failures++, this.circuitBreaker.lastFailure = Date.now(), this.circuitBreaker.failures >= this.circuitBreaker.threshold && (console.error("[CACHE_V3] 🔌 Circuit breaker: CLOSED → OPEN"), this.circuitBreaker.state = "OPEN")
                        }, S.prototype.hasSessionBatch = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(s, a) {
                                (function*() {
                                    n.isInitialized || (yield n.init());
                                    try {
                                        n._checkCircuitBreaker()
                                    } catch (t) {
                                        return console.error("[CACHE_V3] ❌", t.message), s({
                                            withSession: [],
                                            withoutSession: [],
                                            uncached: e
                                        })
                                    }
                                    if (e.length > m) {
                                        console.log("[CACHE_V3] 📦 Batch grande detectado, dividindo em chunks");
                                        for (var a = [], r = 0; r < e.length; r += m) a.push(e.slice(r, r + m));
                                        var c = {
                                            withSession: [],
                                            withoutSession: [],
                                            uncached: []
                                        };
                                        for (var l of a) try {
                                            var u = yield n.hasSessionBatch(l);
                                            c.withSession.push(...u.withSession), c.withoutSession.push(...u.withoutSession), c.uncached.push(...u.uncached), yield new Promise((e => setTimeout(e, 10)))
                                        } catch (e) {
                                            console.error("[CACHE_V3] ❌ Erro no chunk:", e), c.uncached.push(...l)
                                        }
                                        return s(c)
                                    }
                                    console.log("[CACHE_V3] 🔍 Verificação batch:", e.length, "wids");
                                    var p = {
                                            withSession: [],
                                            withoutSession: [],
                                            uncached: []
                                        },
                                        g = Date.now(),
                                        h = 0,
                                        W = [];
                                    for (var f of e) {
                                        var b = n._getFromMemoryCache(f);
                                        b && b.expiresAt > g ? (h++, b.hasSession ? p.withSession.push(f) : p.withoutSession.push(f)) : W.push(f)
                                    }
                                    if (h > 0 && console.log("[CACHE_V3] ⚡ Memory cache hits:", h), W.length > 0) try {
                                        var y = n.db.transaction([d], "readonly").objectStore(d),
                                            S = W.map((function(e) {
                                                return new(i || (i = t("Promise")))((function(t, o) {
                                                    try {
                                                        var s = y.get(e),
                                                            a = setTimeout((function() {
                                                                console.warn("[CACHE_V3] ⏱️ Timeout ao buscar", e), p.uncached.push(e), t()
                                                            }), 5e3);
                                                        s.onsuccess = function() {
                                                            clearTimeout(a);
                                                            var o = s.result;
                                                            !o || o.expiresAt < g ? p.uncached.push(e) : (n._addToMemoryCache(e, o), o.hasSession ? p.withSession.push(e) : p.withoutSession.push(e)), t()
                                                        }, s.onerror = function() {
                                                            clearTimeout(a), console.error("[CACHE_V3] ❌ Erro ao buscar", e, s.error), p.uncached.push(e), t()
                                                        }
                                                    } catch (n) {
                                                        console.error("[CACHE_V3] ❌ Erro ao criar request:", n), p.uncached.push(e), t()
                                                    }
                                                }))
                                            }));
                                        yield Promise.all(S)
                                    } catch (e) {
                                        console.error("[CACHE_V3] ❌ Erro ao acessar IndexedDB:", e), n._recordFailure(), n.stats.errors++, p.uncached.push(...W)
                                    }
                                    if (p.withSession.length > 0) {
                                        var w = Math.min(A, p.withSession.length);
                                        console.log("[CACHE_V3] 🔬 Validando", w, "sessões por amostragem");
                                        var v = p.withSession.slice(0, w),
                                            C = 0;
                                        for (var _ of v) try {
                                            var T = o("WAWebWidFactory").createWid(_),
                                                M = yield o("WAWebSignal").Session.hasSignalSessions([T]);
                                            M && M[0] ? n.stats.validationSuccesses++ : (console.warn("[CACHE_V3] ⚠️ Sessão inválida detectada:", _), C++, p.withSession = p.withSession.filter((e => e !== _)), p.uncached.push(_), yield n.delete(_), n.stats.validationFailures++)
                                        } catch (e) {
                                            console.error("[CACHE_V3] ❌ Erro na validação:", e), n.stats.validationFailures++
                                        }
                                        var P = C / w;
                                        P > E && (console.error("[CACHE_V3] 🚨 Alta taxa de falhas (" + (100 * P).toFixed(1) + "%), invalidando todo cache"), p.uncached.push(...p.withSession), p.withSession = [], yield n.clear())
                                    }
                                    n.stats.hits += p.withSession.length + p.withoutSession.length, n.stats.misses += p.uncached.length, console.log("[CACHE_V3] 📊 Resultado:", {
                                        withSession: p.withSession.length,
                                        withoutSession: p.withoutSession.length,
                                        uncached: p.uncached.length,
                                        hitRate: (n.stats.hits / (n.stats.hits + n.stats.misses) * 100).toFixed(2) + "%"
                                    }), n._recordSuccess(), s(p)
                                })().then(s).catch(a)
                            }))
                        }, S.prototype.setBatch = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                (function*() {
                                    n.isInitialized || (yield n.init()), console.log("[CACHE_V3] 💾 Salvando", e.length, "entradas em batch");
                                    try {
                                        var s = n.db.transaction([d], "readwrite"),
                                            a = s.objectStore(d),
                                            r = Date.now();
                                        e.forEach((function(e) {
                                            var t = e.hasSession ? g.HIGH_CONFIDENCE : g.MEDIUM_CONFIDENCE,
                                                o = {
                                                    wid: e.wid,
                                                    hasSession: e.hasSession,
                                                    createdAt: r,
                                                    expiresAt: r + t,
                                                    updatedAt: r,
                                                    confidence: e.hasSession ? "HIGH" : "MEDIUM",
                                                    validationCount: 0
                                                };
                                            a.put(o), n._addToMemoryCache(e.wid, o)
                                        })), s.oncomplete = function() {
                                            n.stats.sets += e.length, console.log("[CACHE_V3] ✅ Batch salvo com sucesso"), t()
                                        }, s.onerror = function() {
                                            console.error("[CACHE_V3] ❌ Erro ao salvar batch:", s.error), n._recordFailure(), n.stats.errors++, o(s.error)
                                        }
                                    } catch (e) {
                                        console.error("[CACHE_V3] ❌ Erro ao iniciar transação:", e), n._recordFailure(), n.stats.errors++, o(e)
                                    }
                                })().then(t).catch(o)
                            }))
                        }, S.prototype.delete = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                if (n.isInitialized) try {
                                    n.memoryCache.delete(e);
                                    var s = n.db.transaction([d], "readwrite").objectStore(d).delete(e);
                                    s.onsuccess = function() {
                                        n.stats.deletes++, t()
                                    }, s.onerror = function() {
                                        console.error("[CACHE_V3] ❌ Erro ao deletar", e, s.error), n.stats.errors++, o(s.error)
                                    }
                                } catch (e) {
                                    console.error("[CACHE_V3] ❌ Erro ao iniciar delete:", e), n.stats.errors++, o(e)
                                } else n.init().then((function() {
                                    n.delete(e).then(t).catch(o)
                                })).catch(o)
                            }))
                        }, S.prototype.clear = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                if (e.isInitialized) {
                                    console.log("[CACHE_V3] 🧹 Limpando todo o cache");
                                    try {
                                        e.memoryCache.clear(), e.memoryCacheAccessOrder = [];
                                        var o = e.db.transaction([d], "readwrite").objectStore(d).clear();
                                        o.onsuccess = function() {
                                            console.log("[CACHE_V3] ✅ Cache limpo com sucesso"), t()
                                        }, o.onerror = function() {
                                            console.error("[CACHE_V3] ❌ Erro ao limpar cache:", o.error), e.stats.errors++, n(o.error)
                                        }
                                    } catch (t) {
                                        console.error("[CACHE_V3] ❌ Erro ao iniciar clear:", t), e.stats.errors++, n(t)
                                    }
                                } else e.init().then((function() {
                                    e.clear().then(t).catch(n)
                                })).catch(n)
                            }))
                        }, S.prototype.invalidateOnError = function(e) {
                            var n = this;
                            return new(i || (i = t("Promise")))((function(t, o) {
                                (function*() {
                                    n.isInitialized || (yield n.init()), console.log("[CACHE_V3] ⚠️ Invalidando", e.length, "WIDs após erro");
                                    try {
                                        var s = n.db.transaction([d], "readwrite"),
                                            a = s.objectStore(d);
                                        e.forEach((function(e) {
                                            var t = "string" == typeof e ? e : e.toString();
                                            a.delete(t), n.memoryCache.delete(t)
                                        })), s.oncomplete = function() {
                                            console.log("[CACHE_V3] ✅ Invalidação concluída"), t()
                                        }, s.onerror = function() {
                                            console.error("[CACHE_V3] ❌ Erro na invalidação:", s.error), o(s.error)
                                        }
                                    } catch (e) {
                                        console.error("[CACHE_V3] ❌ Erro ao iniciar invalidação:", e), o(e)
                                    }
                                })().then(t).catch(o)
                            }))
                        }, S.prototype.getStatistics = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                (function*() {
                                    e.isInitialized || (yield e.init());
                                    try {
                                        var n = e.db.transaction([d], "readonly").objectStore(d).count();
                                        n.onsuccess = function() {
                                            var o = n.result,
                                                s = e.stats.hits + e.stats.misses,
                                                a = s > 0 ? (e.stats.hits / s * 100).toFixed(2) : 0,
                                                r = {
                                                    totalEntries: o,
                                                    maxEntries: h,
                                                    fillPercentage: (o / h * 100).toFixed(2) + "%",
                                                    hits: e.stats.hits,
                                                    misses: e.stats.misses,
                                                    hitRate: a + "%",
                                                    sets: e.stats.sets,
                                                    deletes: e.stats.deletes,
                                                    errors: e.stats.errors,
                                                    validationSuccesses: e.stats.validationSuccesses,
                                                    validationFailures: e.stats.validationFailures,
                                                    lastHealthCheck: e.stats.lastHealthCheck ? new Date(e.stats.lastHealthCheck).toISOString() : null,
                                                    memoryCacheSize: e.memoryCache.size,
                                                    circuitBreakerState: e.circuitBreaker.state,
                                                    circuitBreakerFailures: e.circuitBreaker.failures
                                                };
                                            t(r)
                                        }, n.onerror = function() {
                                            console.error("[CACHE_V3] ❌ Erro ao obter estatísticas:", n.error), t(e.stats)
                                        }
                                    } catch (n) {
                                        console.error("[CACHE_V3] ❌ Erro ao buscar estatísticas:", n), t(e.stats)
                                    }
                                })().then(t).catch(n)
                            }))
                        }, S.prototype._loadStatistics = function() {
                            var e = this;
                            return new(i || (i = t("Promise")))((function(t, n) {
                                try {
                                    var o = e.db.transaction([u], "readonly").objectStore(u).get("main");
                                    o.onsuccess = function() {
                                        o.result && (Object.assign(e.stats, o.result), console.log("[CACHE_V3] 📊 Stats carregados do disco")), t()
                                    }, o.onerror = function() {
                                        console.warn("[CACHE_V3] ⚠️ Erro ao carregar stats:", o.error), t()
                                    }
                                } catch (e) {
                                    console.warn("[CACHE_V3] ⚠️ Erro ao iniciar load stats:", e), t()
                                }
                            }))
                        }, S.prototype._saveStatistics = function() {
                            if (this.isInitialized && !this.isShuttingDown) try {
                                var e = this.db.transaction([u], "readwrite").objectStore(u),
                                    t = Object.assign({}, this.stats, {
                                        id: "main"
                                    });
                                e.put(t)
                            } catch (e) {
                                console.error("[CACHE_V3] ❌ Erro ao salvar stats:", e)
                            }
                        }, S.prototype.shutdown = function() {
                            console.log("[CACHE_V3] 🛑 Iniciando shutdown..."), this.isShuttingDown = !0, this._stopWorkers(), this._saveStatistics(), this.memoryCache.clear(), this.memoryCacheAccessOrder = [], this.db && (this.db.close(), this.db = null), this.isInitialized = !1, console.log("[CACHE_V3] ✅ Shutdown completo")
                        };
                        var w = null;
                        r.E2ESessionCache = S, r.getCache = function() {
                            return w || (w = new S), w
                        }
                    }), 98), __d("WAWebManageE2ESessionsJob_nulled", ["Promise", "WALogger", "WAResolvable", "WAShiftTimer", "WAWebAppTracker", "WAWebE2ESessionCache", "WAWebEventsWaitForOfflineDeliveryEnd", "WAWebFetchPrekeysJob_status", "WAWebManagePhoneNumberMappingJob", "WAWebProcessKeyBundle", "WAWebRunInBatches", "WAWebSignal", "WAWebWid", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i, c = new Map,
                            l = new Map,
                            d = new Set,
                            u = new Set,
                            p = {
                                SESSION_CHECK: 100,
                                PROCESS_KEY_BUNDLES: 5
                            };

                        function g(e, t, n) {
                            return h.apply(this, arguments)
                        }

                        function h() {
                            return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                void 0 === s && (s = !1), void 0 === a && (a = !1);
                                var r = Date.now();
                                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("[E2E] 🚀 INICIANDO ensureE2ESessions"), console.log("[E2E] Total de WIDs:", e.length), console.log("[E2E] Run in background:", a), console.log("[E2E] User reason identity:", s), console.log("[E2E] WIDs:", e.map((function(e) {
                                    return e.toString()
                                })).join(", ")), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("\n[E2E_CACHE] 📦 ETAPA 1/5: CONSULTA DE CACHE"), console.log("[E2E_CACHE] Inicializando cache...");
                                var g, h = o("WAWebE2ESessionCache").getCache();
                                console.log("[E2E_CACHE] ✓ Cache inicializado");
                                var m = {
                                    hits: 0,
                                    misses: 0,
                                    withoutSession: 0,
                                    errors: 0
                                };
                                try {
                                    console.log("[E2E_CACHE] Convertendo", e.length, "WIDs para strings...");
                                    var W = e.map((function(e) {
                                        return e.toString()
                                    }));
                                    console.log("[E2E_CACHE] ✓ WIDs convertidos"), console.log("[E2E_CACHE] Consultando cache em lote..."), g = yield h.hasSessionBatch(W), console.log("[E2E_CACHE] ✓ Consulta ao cache concluída"), console.log("\n[E2E_CACHE] 📊 RESULTADO DO CACHE:"), console.log("[E2E_CACHE] ├─ Com sessão (cache hit):", g.withSession.length), console.log("[E2E_CACHE] ├─ Sem sessão (cache hit):", g.withoutSession.length), console.log("[E2E_CACHE] └─ Não cacheados (cache miss):", g.uncached.length), m.hits = g.withSession.length, m.withoutSession = g.withoutSession.length, m.misses = g.uncached.length, console.log("\n[E2E_CACHE] Criando mapa de conversão WID...");
                                    var f = new Map;
                                    e.forEach((function(e) {
                                        f.set(e.toString(), e)
                                    })), console.log("[E2E_CACHE] ✓ Mapa criado com", f.size, "entradas"), console.log("[E2E_CACHE] Convertendo resultados do cache de volta para objetos WID...");
                                    var b = g.withSession.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] ├─ WIDs com sessão convertidos:", b.length);
                                    var y = g.withoutSession.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] ├─ WIDs sem sessão convertidos:", y.length);
                                    var A = g.uncached.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] └─ WIDs não cacheados convertidos:", A.length);
                                    var E = A.length + y.length;
                                    if (console.log("\n[E2E_CACHE] 🔍 ANÁLISE DE COBERTURA:"), console.log("[E2E_CACHE] Total original:", e.length), console.log("[E2E_CACHE] Resolvidos pelo cache:", b.length), console.log("[E2E_CACHE] Precisam processamento:", E), console.log("[E2E_CACHE] Taxa de acerto:", (b.length / e.length * 100).toFixed(2) + "%"), 0 === A.length && 0 === y.length) {
                                        console.log("\n[E2E_CACHE] ✅ CACHE HIT COMPLETO - 100% RESOLVIDO"), console.log("[E2E_CACHE] Todos os", e.length, "WIDs já possuem sessão estabelecida"), console.log("[E2E_CACHE] Obtendo estatísticas finais do cache...");
                                        var S = yield h.getStatistics();
                                        console.log("[E2E_CACHE] 📈 ESTATÍSTICAS FINAIS DO CACHE:"), console.log(JSON.stringify(S, null, 2));
                                        var w = Date.now() - r;
                                        return console.log("\n[E2E] ✅ PROCESSO CONCLUÍDO (CACHE COMPLETO)"), console.log("[E2E] Duração total:", w, "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                            missedPrekeyCount: 0,
                                            depletedPrekeyCount: 0,
                                            processedPrekeyCount: e.length,
                                            cacheHits: e.length,
                                            cacheMisses: 0,
                                            cacheWithoutSession: 0,
                                            duration: w
                                        }
                                    }
                                    console.log("\n[E2E_CACHE] 🔄 ATUALIZANDO LISTA DE PROCESSAMENTO"), console.log("[E2E_CACHE] WIDs originais:", e.length), e = A.concat(y), console.log("[E2E_CACHE] ✓ Lista atualizada:", e.length, "WIDs"), console.log("[E2E_CACHE] ├─ Não cacheados:", A.length), console.log("[E2E_CACHE] └─ Sem sessão (do cache):", y.length)
                                } catch (e) {
                                    console.error("\n[E2E_CACHE] ❌ ERRO AO CONSULTAR CACHE"), console.error("[E2E_CACHE] Erro:", e.message), console.error("[E2E_CACHE] Stack:", e.stack), console.warn("[E2E_CACHE] ⚠️  Continuando sem cache - usando fluxo completo"), m.errors++
                                }
                                if (0 === e.length) return console.log("\n[E2E] ℹ️  NENHUM WID REQUER PROCESSAMENTO"), console.log("[E2E] Todos os WIDs já foram resolvidos pelo cache"), w = Date.now() - r, console.log("[E2E] Duração total:", w, "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                    missedPrekeyCount: 0,
                                    depletedPrekeyCount: 0,
                                    processedPrekeyCount: 0,
                                    cacheHits: m.hits,
                                    cacheMisses: m.misses,
                                    cacheWithoutSession: m.withoutSession,
                                    duration: w
                                };
                                console.log("\n[E2E] 🔧 ETAPA 2/5: PREPARAÇÃO DO AMBIENTE"), console.log("[E2E] Aguardando conclusão de entrega offline..."), yield o("WAWebEventsWaitForOfflineDeliveryEnd").waitForOfflineDeliveryEnd(), console.log("[E2E] ✓ Entrega offline concluída"), console.log("[E2E] Iniciando rastreamento de processamento de prekey..."), o("WAWebAppTracker").AppTracker.start(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), console.log("[E2E] ✓ Rastreamento iniciado"), console.log("\n[E2E] 🗺️  MAPEAMENTO LID (Phone Number to LID)");
                                try {
                                    console.log("[E2E] Garantindo mapeamento para", e.length, "WIDs..."), yield o("WAWebManagePhoneNumberMappingJob").ensurePhoneNumberToLidMapping(e), console.log("[E2E] ✓ Mapeamento LID concluído")
                                } catch (e) {
                                    console.warn("[E2E] ⚠️  Falha no mapeamento LID:", e.message), console.warn("[E2E] Continuando processamento...")
                                }
                                console.log("\n[E2E] Inicializando estruturas de controle...");
                                var v = new(o("WAResolvable").Resolvable),
                                    C = [],
                                    _ = [];
                                if (console.log("[E2E] ✓ Estruturas inicializadas"), !a) {
                                    console.log("[E2E] Modo foreground - limpando requisições pendentes...");
                                    var T = 0;
                                    u.forEach((function(e) {
                                        e.abort(), T++
                                    })), console.log("[E2E] ├─ Abortados:", T, "controladores");
                                    var M = 0;
                                    d.forEach((function(e) {
                                        _.push(e), l.set(e, v.promise), M++
                                    })), d.clear(), console.log("[E2E] └─ Limpos:", M, "WIDs pendentes")
                                }
                                console.log("\n[E2E] 🔍 PROCESSANDO", e.length, "WIDs...");
                                var P = 0,
                                    x = 0,
                                    L = 0;
                                e.forEach((function(e) {
                                    if (!e.isUserNotPSA()) return console.log("[E2E] ⚠️  WID inválido (não é usuário):", e.toString()), void x++;
                                    P++;
                                    var t = c.get(e);
                                    t && (console.log("[E2E] Cancelando requisição anterior para:", e.toString()), t.cancel(), c.delete(e)), (t = l.get(e)) ? (console.log("[E2E] WID duplicado (dedupe):", e.toString()), C.push(t), L++) : (_.push(e), l.set(e, v.promise))
                                })), console.log("[E2E] 📊 RESULTADO DA VALIDAÇÃO:"), console.log("[E2E] ├─ Válidos:", P), console.log("[E2E] ├─ Inválidos:", x), console.log("[E2E] ├─ Dedupados:", L), console.log("[E2E] └─ Para processar:", _.length);
                                var U = 0,
                                    k = 0,
                                    D = null,
                                    I = [];
                                try {
                                    if (_.length > 0) {
                                        console.log("\n[E2E] 🔐 ETAPA 3/5: VERIFICAÇÃO DE SESSÕES"), console.log("[E2E] Verificando sessões Signal para", _.length, "WIDs...");
                                        var R = [];
                                        a ? (console.log("[E2E] Modo background - usando processamento em lotes"), D = new AbortController, u.add(D), console.log("[E2E] ✓ AbortController criado"), console.log("[E2E] Adicionando WIDs ao conjunto de processamento..."), _.forEach((function(e) {
                                            d.add(e)
                                        })), console.log("[E2E] ✓", _.length, "WIDs adicionados"), console.log("[E2E] Executando verificação em lotes (batch size:", p.SESSION_CHECK + ")..."), yield o("WAWebRunInBatches").runInBatches(_, function() {
                                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                var t;
                                                console.log("[E2E_BATCH] Verificando lote de", e.length, "WIDs..."), e = yield o("WAWebSignal").Session.hasSignalSessions(e), (t = R).push.apply(t, e), console.log("[E2E_BATCH] ✓ Lote verificado -", e.filter(Boolean).length, "com sessão")
                                            }));
                                            return function(t) {
                                                return e.apply(this, arguments)
                                            }
                                        }(), p.SESSION_CHECK, D), console.log("[E2E] ✓ Verificação em lotes concluída")) : (console.log("[E2E] Modo foreground - verificação direta"), R = yield o("WAWebSignal").Session.hasSignalSessions(_), console.log("[E2E] ✓ Verificação concluída")), console.log("\n[E2E] 📋 ANALISANDO RESULTADOS DA VERIFICAÇÃO");
                                        var O = [],
                                            B = 0,
                                            N = 0;
                                        if (_.forEach((function(e, t) {
                                                R[t] ? (console.log("[E2E] ✓ Sessão existente:", e.toString()), d.delete(e), I.push({
                                                    wid: e.toString(),
                                                    hasSession: !0
                                                }), B++) : (console.log("[E2E] ✗ Sem sessão:", e.toString()), O.push(e), I.push({
                                                    wid: e.toString(),
                                                    hasSession: !1
                                                }), N++)
                                            })), console.log("[E2E] 📊 RESULTADO DA VERIFICAÇÃO:"), console.log("[E2E] ├─ Com sessão existente:", B), console.log("[E2E] ├─ Sem sessão (precisam prekey):", N), console.log("[E2E] └─ Total verificado:", _.length), O.length > 0)
                                            if (console.log("\n[E2E] 🔑 ETAPA 4/5: BUSCA E PROCESSAMENTO DE PREKEYS"), console.log("[E2E] Buscando prekeys para", O.length, "WIDs sem sessão..."), U = O.length, a) {
                                                console.log("[E2E] Modo background - processamento em lotes"), console.log("[E2E] Buscando bundles de prekeys..."), a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeyBundles(O, s), console.log("[E2E] ✓ Bundles recebidos:", a.length), console.log("[E2E] Ordenando bundles..."), a = o("WAWebFetchPrekeysJob_status").sortPrekeyBundles(a), console.log("[E2E] ✓ Bundles ordenados");
                                                var G = 0;
                                                console.log("[E2E] Processando bundles em lotes (batch size:", p.PROCESS_KEY_BUNDLES + ")..."), yield o("WAWebRunInBatches").runInBatches(a, function() {
                                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                        console.log("[E2E_BUNDLE] Processando lote de", e.length, "bundles...");
                                                        var t = 0;
                                                        e.forEach((function(e) {
                                                            (null == e ? void 0 : e.wid) instanceof n("WAWebWid") && (d.delete(e.wid), t++)
                                                        })), console.log("[E2E_BUNDLE] ├─ Bundles válidos:", t), console.log("[E2E_BUNDLE] Processando key bundles...");
                                                        var s = (e = yield o("WAWebProcessKeyBundle").processKeyBundles([].concat(e))).depletedPrekeyCount,
                                                            a = e.processedPrekeyCount;
                                                        if (k += null != s ? s : 0, G += null != a ? a : 0, console.log("[E2E_BUNDLE] ├─ Processados:", a), console.log("[E2E_BUNDLE] ├─ Esgotados:", s), console.log("[E2E_BUNDLE] └─ Total acumulado:", G), a > 0) {
                                                            console.log("[E2E_BUNDLE] Atualizando status do cache para sessões estabelecidas...");
                                                            var r = 0;
                                                            e.forEach((function(e) {
                                                                if (e && e.wid) {
                                                                    var t = I.find((function(t) {
                                                                        return t.wid === e.wid.toString()
                                                                    }));
                                                                    t && (t.hasSession = !0, r++)
                                                                }
                                                            })), console.log("[E2E_BUNDLE] ✓", r, "entradas do cache marcadas como tendo sessão")
                                                        }
                                                    }));
                                                    return function(t) {
                                                        return e.apply(this, arguments)
                                                    }
                                                }(), p.PROCESS_KEY_BUNDLES, D), console.log("\n[E2E] ✅ PROCESSAMENTO DE BUNDLES CONCLUÍDO"), console.log("[E2E] Sessões estabelecidas:", G, "de", O.length), console.log("[E2E] Taxa de sucesso:", (G / O.length * 100).toFixed(2) + "%")
                                            } else console.log("[E2E] Modo foreground - busca direta de prekeys"), a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeys(O, s), k = null != (s = a.depletedPrekeyCount) ? s : 0, console.log("[E2E] ✓ Prekeys buscados"), console.log("[E2E] Prekeys esgotados:", k);
                                        else console.log("\n[E2E] ✓ TODOS OS WIDs JÁ POSSUEM SESSÃO"), console.log("[E2E] Nenhuma busca de prekey necessária")
                                    } else console.log("\n[E2E] ℹ️  NENHUM WID PARA PROCESSAR");
                                    console.log("\n[E2E] Resolvendo promessas..."), v.resolve(), console.log("[E2E] ✓ Promessas resolvidas")
                                } catch (e) {
                                    throw console.error("\n[E2E] ❌ ERRO NO PROCESSAMENTO"), console.error("[E2E] Erro:", e.message), console.error("[E2E] Stack:", e.stack), console.log("[E2E] Resolvendo promessas com erro..."), v.resolve(e), console.log("[E2E] Parando rastreamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    console.log("\n[E2E] 🧹 ETAPA 5/5: LIMPEZA E ATUALIZAÇÃO"), console.log("[E2E] Limpando estruturas de controle...");
                                    var H = 0;
                                    if (_.forEach((function(e) {
                                            l.delete(e), d.delete(e), H++
                                        })), console.log("[E2E] ✓", H, "WIDs limpos"), D && (console.log("[E2E] Removendo AbortController..."), u.delete(D), console.log("[E2E] ✓ AbortController removido")), I.length > 0 && h) {
                                        console.log("\n[E2E_CACHE] 💾 ATUALIZANDO CACHE"), console.log("[E2E_CACHE] Entradas para atualizar:", I.length);
                                        var F = I.filter((function(e) {
                                                return e.hasSession
                                            })).length,
                                            z = I.filter((function(e) {
                                                return !e.hasSession
                                            })).length;
                                        console.log("[E2E_CACHE] ├─ Com sessão:", F), console.log("[E2E_CACHE] └─ Sem sessão:", z);
                                        try {
                                            console.log("[E2E_CACHE] Salvando em lote..."), yield h.setBatch(I), console.log("[E2E_CACHE] ✅ Cache atualizado com sucesso"), console.log("[E2E_CACHE] Obtendo estatísticas finais..."), S = yield h.getStatistics(), console.log("[E2E_CACHE] 📈 ESTATÍSTICAS FINAIS:"), console.log(JSON.stringify(S, null, 2))
                                        } catch (e) {
                                            console.error("[E2E_CACHE] ❌ ERRO AO ATUALIZAR CACHE"), console.error("[E2E_CACHE] Erro:", e.message), m.errors++
                                        }
                                    } else console.log("\n[E2E_CACHE] ℹ️  Nenhuma atualização de cache necessária")
                                }
                                console.log("\n[E2E] 🔄 PROCESSANDO REQUISIÇÕES DEDUPADAS");
                                try {
                                    if (C.length > 0) {
                                        if (console.log("[E2E] Aguardando", C.length, "promessas dedupadas..."), a = (yield(i || (i = t("Promise"))).all(C)).find(Boolean)) throw console.log("[E2E] ⚠️  Erro encontrado em requisição dedupada"), a;
                                        console.log("[E2E] ✓ Todas as requisições dedupadas concluídas")
                                    } else console.log("[E2E] Nenhuma requisição dedupada para processar")
                                } catch (e) {
                                    throw console.error("[E2E] ❌ ERRO EM REQUISIÇÕES DEDUPADAS"), console.error("[E2E] Erro:", e.message), console.log("[E2E] Parando rastreamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    console.log("[E2E] Finalizando rastreamento de processamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), console.log("[E2E] ✓ Rastreamento finalizado")
                                }
                                return w = Date.now() - r, console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("[E2E] ✅ PROCESSO CONCLUÍDO COM SUCESSO"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("\n[E2E] 📊 RESUMO DA EXECUÇÃO:"), console.log("[E2E] Total de WIDs processados:", e.length), console.log("[E2E] ├─ Sessões existentes:", _.length - U), console.log("[E2E] ├─ Prekeys solicitados:", U), console.log("[E2E] ├─ Prekeys esgotados:", k), console.log("[E2E] └─ Requisições dedupadas:", C.length), console.log("\n[E2E] 💾 ESTATÍSTICAS DO CACHE:"), console.log("[E2E] ├─ Cache hits:", m.hits), console.log("[E2E] ├─ Cache misses:", m.misses), console.log("[E2E] ├─ Sem sessão (cache):", m.withoutSession), console.log("[E2E] └─ Erros de cache:", m.errors), console.log("\n[E2E] ⏱️  PERFORMANCE:"), console.log("[E2E] Duração total:", w, "ms"), console.log("[E2E] Média por WID:", (w / e.length).toFixed(2), "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                    missedPrekeyCount: U,
                                    depletedPrekeyCount: k,
                                    processedPrekeyCount: _.length - U,
                                    cacheHits: m.hits,
                                    cacheMisses: m.misses,
                                    cacheWithoutSession: m.withoutSession,
                                    cacheErrors: m.errors,
                                    duration: w
                                }
                            })), h.apply(this, arguments)
                        }
                        r.ensureE2ESessions = g, r.ensureE2ESessionsWithDelay = function(e, t, n) {
                            void 0 === n && (n = !1);
                            var s = new(o("WAShiftTimer").ShiftTimer)((function() {
                                g(e, n)
                            }));
                            e.forEach((function(e) {
                                c.set(e, s)
                            })), s.onOrAfter(1e3 * t)
                        }
                    }), 98), __d("WAWebManageE2ESessionsJob_status_", ["Promise", "WALogger", "WAResolvable", "WAShiftTimer", "WAWebAppTracker", "WAWebE2ESessionCache", "WAWebEventsWaitForOfflineDeliveryEnd", "WAWebFetchPrekeysJob_status", "WAWebManagePhoneNumberMappingJob", "WAWebProcessKeyBundle", "WAWebRunInBatches", "WAWebSignal", "WAWebWid", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i, c = new Map,
                            l = new Map,
                            d = new Set,
                            u = new Set,
                            p = {
                                SESSION_CHECK: 100,
                                PROCESS_KEY_BUNDLES: 5
                            };

                        function g(e, t, n) {
                            return h.apply(this, arguments)
                        }

                        function h() {
                            return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                void 0 === s && (s = !1), void 0 === a && (a = !1);
                                var r = Date.now();
                                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("[E2E] 🚀 INICIANDO ensureE2ESessions"), console.log("[E2E] Total de WIDs:", e.length), console.log("[E2E] Run in background:", a), console.log("[E2E] User reason identity:", s), console.log("[E2E] WIDs:", e.map((function(e) {
                                    return e.toString()
                                })).join(", ")), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("\n[E2E_CACHE] 📦 ETAPA 1/5: CONSULTA DE CACHE"), console.log("[E2E_CACHE] Inicializando cache...");
                                var g, h = o("WAWebE2ESessionCache").getCache();
                                console.log("[E2E_CACHE] ✓ Cache inicializado");
                                var m = {
                                    hits: 0,
                                    misses: 0,
                                    withoutSession: 0,
                                    errors: 0
                                };
                                try {
                                    console.log("[E2E_CACHE] Convertendo", e.length, "WIDs para strings...");
                                    var W = e.map((function(e) {
                                        return e.toString()
                                    }));
                                    console.log("[E2E_CACHE] ✓ WIDs convertidos"), console.log("[E2E_CACHE] Consultando cache em lote..."), g = yield h.hasSessionBatch(W), console.log("[E2E_CACHE] ✓ Consulta ao cache concluída"), console.log("\n[E2E_CACHE] 📊 RESULTADO DO CACHE:"), console.log("[E2E_CACHE] ├─ Com sessão (cache hit):", g.withSession.length), console.log("[E2E_CACHE] ├─ Sem sessão (cache hit):", g.withoutSession.length), console.log("[E2E_CACHE] └─ Não cacheados (cache miss):", g.uncached.length), m.hits = g.withSession.length, m.withoutSession = g.withoutSession.length, m.misses = g.uncached.length, console.log("\n[E2E_CACHE] Criando mapa de conversão WID...");
                                    var f = new Map;
                                    e.forEach((function(e) {
                                        f.set(e.toString(), e)
                                    })), console.log("[E2E_CACHE] ✓ Mapa criado com", f.size, "entradas"), console.log("[E2E_CACHE] Convertendo resultados do cache de volta para objetos WID...");
                                    var b = g.withSession.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] ├─ WIDs com sessão convertidos:", b.length);
                                    var y = g.withoutSession.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] ├─ WIDs sem sessão convertidos:", y.length);
                                    var A = g.uncached.map((function(e) {
                                        return f.get(e)
                                    })).filter(Boolean);
                                    console.log("[E2E_CACHE] └─ WIDs não cacheados convertidos:", A.length);
                                    var E = A.length + y.length;
                                    if (console.log("\n[E2E_CACHE] 🔍 ANÁLISE DE COBERTURA:"), console.log("[E2E_CACHE] Total original:", e.length), console.log("[E2E_CACHE] Resolvidos pelo cache:", b.length), console.log("[E2E_CACHE] Precisam processamento:", E), console.log("[E2E_CACHE] Taxa de acerto:", (b.length / e.length * 100).toFixed(2) + "%"), 0 === A.length && 0 === y.length) {
                                        console.log("\n[E2E_CACHE] ✅ CACHE HIT COMPLETO - 100% RESOLVIDO"), console.log("[E2E_CACHE] Todos os", e.length, "WIDs já possuem sessão estabelecida"), console.log("[E2E_CACHE] Obtendo estatísticas finais do cache...");
                                        var S = yield h.getStatistics();
                                        console.log("[E2E_CACHE] 📈 ESTATÍSTICAS FINAIS DO CACHE:"), console.log(JSON.stringify(S, null, 2));
                                        var w = Date.now() - r;
                                        return console.log("\n[E2E] ✅ PROCESSO CONCLUÍDO (CACHE COMPLETO)"), console.log("[E2E] Duração total:", w, "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                            missedPrekeyCount: 0,
                                            depletedPrekeyCount: 0,
                                            processedPrekeyCount: e.length,
                                            cacheHits: e.length,
                                            cacheMisses: 0,
                                            cacheWithoutSession: 0,
                                            duration: w
                                        }
                                    }
                                    console.log("\n[E2E_CACHE] 🔄 ATUALIZANDO LISTA DE PROCESSAMENTO"), console.log("[E2E_CACHE] WIDs originais:", e.length), e = A.concat(y), console.log("[E2E_CACHE] ✓ Lista atualizada:", e.length, "WIDs"), console.log("[E2E_CACHE] ├─ Não cacheados:", A.length), console.log("[E2E_CACHE] └─ Sem sessão (do cache):", y.length)
                                } catch (e) {
                                    console.error("\n[E2E_CACHE] ❌ ERRO AO CONSULTAR CACHE"), console.error("[E2E_CACHE] Erro:", e.message), console.error("[E2E_CACHE] Stack:", e.stack), console.warn("[E2E_CACHE] ⚠️  Continuando sem cache - usando fluxo completo"), m.errors++
                                }
                                if (0 === e.length) return console.log("\n[E2E] ℹ️  NENHUM WID REQUER PROCESSAMENTO"), console.log("[E2E] Todos os WIDs já foram resolvidos pelo cache"), w = Date.now() - r, console.log("[E2E] Duração total:", w, "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                    missedPrekeyCount: 0,
                                    depletedPrekeyCount: 0,
                                    processedPrekeyCount: 0,
                                    cacheHits: m.hits,
                                    cacheMisses: m.misses,
                                    cacheWithoutSession: m.withoutSession,
                                    duration: w
                                };
                                console.log("\n[E2E] 🔧 ETAPA 2/5: PREPARAÇÃO DO AMBIENTE"), console.log("[E2E] Aguardando conclusão de entrega offline..."), yield o("WAWebEventsWaitForOfflineDeliveryEnd").waitForOfflineDeliveryEnd(), console.log("[E2E] ✓ Entrega offline concluída"), console.log("[E2E] Iniciando rastreamento de processamento de prekey..."), o("WAWebAppTracker").AppTracker.start(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), console.log("[E2E] ✓ Rastreamento iniciado"), console.log("\n[E2E] 🗺️  MAPEAMENTO LID (Phone Number to LID)");
                                try {
                                    console.log("[E2E] Garantindo mapeamento para", e.length, "WIDs..."), yield o("WAWebManagePhoneNumberMappingJob").ensurePhoneNumberToLidMapping(e), console.log("[E2E] ✓ Mapeamento LID concluído")
                                } catch (e) {
                                    console.warn("[E2E] ⚠️  Falha no mapeamento LID:", e.message), console.warn("[E2E] Continuando processamento...")
                                }
                                console.log("\n[E2E] Inicializando estruturas de controle...");
                                var v = new(o("WAResolvable").Resolvable),
                                    C = [],
                                    _ = [];
                                if (console.log("[E2E] ✓ Estruturas inicializadas"), !a) {
                                    console.log("[E2E] Modo foreground - limpando requisições pendentes...");
                                    var T = 0;
                                    u.forEach((function(e) {
                                        e.abort(), T++
                                    })), console.log("[E2E] ├─ Abortados:", T, "controladores");
                                    var M = 0;
                                    d.forEach((function(e) {
                                        _.push(e), l.set(e, v.promise), M++
                                    })), d.clear(), console.log("[E2E] └─ Limpos:", M, "WIDs pendentes")
                                }
                                console.log("\n[E2E] 🔍 PROCESSANDO", e.length, "WIDs...");
                                var P = 0,
                                    x = 0,
                                    L = 0;
                                e.forEach((function(e) {
                                    if (!e.isUserNotPSA()) return console.log("[E2E] ⚠️  WID inválido (não é usuário):", e.toString()), void x++;
                                    P++;
                                    var t = c.get(e);
                                    t && (console.log("[E2E] Cancelando requisição anterior para:", e.toString()), t.cancel(), c.delete(e)), (t = l.get(e)) ? (console.log("[E2E] WID duplicado (dedupe):", e.toString()), C.push(t), L++) : (_.push(e), l.set(e, v.promise))
                                })), console.log("[E2E] 📊 RESULTADO DA VALIDAÇÃO:"), console.log("[E2E] ├─ Válidos:", P), console.log("[E2E] ├─ Inválidos:", x), console.log("[E2E] ├─ Dedupados:", L), console.log("[E2E] └─ Para processar:", _.length);
                                var U = 0,
                                    k = 0,
                                    D = null,
                                    I = [];
                                try {
                                    if (_.length > 0) {
                                        console.log("\n[E2E] 🔐 ETAPA 3/5: VERIFICAÇÃO DE SESSÕES"), console.log("[E2E] Verificando sessões Signal para", _.length, "WIDs...");
                                        var R = [];
                                        a ? (console.log("[E2E] Modo background - usando processamento em lotes"), D = new AbortController, u.add(D), console.log("[E2E] ✓ AbortController criado"), console.log("[E2E] Adicionando WIDs ao conjunto de processamento..."), _.forEach((function(e) {
                                            d.add(e)
                                        })), console.log("[E2E] ✓", _.length, "WIDs adicionados"), console.log("[E2E] Executando verificação em lotes (batch size:", p.SESSION_CHECK + ")..."), yield o("WAWebRunInBatches").runInBatches(_, function() {
                                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                var t;
                                                console.log("[E2E_BATCH] Verificando lote de", e.length, "WIDs..."), e = yield o("WAWebSignal").Session.hasSignalSessions(e), (t = R).push.apply(t, e), console.log("[E2E_BATCH] ✓ Lote verificado -", e.filter(Boolean).length, "com sessão")
                                            }));
                                            return function(t) {
                                                return e.apply(this, arguments)
                                            }
                                        }(), p.SESSION_CHECK, D), console.log("[E2E] ✓ Verificação em lotes concluída")) : (console.log("[E2E] Modo foreground - verificação direta"), R = yield o("WAWebSignal").Session.hasSignalSessions(_), console.log("[E2E] ✓ Verificação concluída")), console.log("\n[E2E] 📋 ANALISANDO RESULTADOS DA VERIFICAÇÃO");
                                        var O = [],
                                            B = 0,
                                            N = 0;
                                        if (_.forEach((function(e, t) {
                                                R[t] ? (console.log("[E2E] ✓ Sessão existente:", e.toString()), d.delete(e), I.push({
                                                    wid: e.toString(),
                                                    hasSession: !0
                                                }), B++) : (console.log("[E2E] ✗ Sem sessão:", e.toString()), O.push(e), I.push({
                                                    wid: e.toString(),
                                                    hasSession: !1
                                                }), N++)
                                            })), console.log("[E2E] 📊 RESULTADO DA VERIFICAÇÃO:"), console.log("[E2E] ├─ Com sessão existente:", B), console.log("[E2E] ├─ Sem sessão (precisam prekey):", N), console.log("[E2E] └─ Total verificado:", _.length), O.length > 0)
                                            if (console.log("\n[E2E] 🔑 ETAPA 4/5: BUSCA E PROCESSAMENTO DE PREKEYS"), console.log("[E2E] Buscando prekeys para", O.length, "WIDs sem sessão..."), U = O.length, a) {
                                                console.log("[E2E] Modo background - processamento em lotes"), console.log("[E2E] Buscando bundles de prekeys..."), a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeyBundles(O, s), console.log("[E2E] ✓ Bundles recebidos:", a.length), console.log("[E2E] Ordenando bundles..."), a = o("WAWebFetchPrekeysJob_status").sortPrekeyBundles(a), console.log("[E2E] ✓ Bundles ordenados");
                                                var G = 0;
                                                console.log("[E2E] Processando bundles em lotes (batch size:", p.PROCESS_KEY_BUNDLES + ")..."), yield o("WAWebRunInBatches").runInBatches(a, function() {
                                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                        console.log("[E2E_BUNDLE] Processando lote de", e.length, "bundles...");
                                                        var t = 0;
                                                        e.forEach((function(e) {
                                                            (null == e ? void 0 : e.wid) instanceof n("WAWebWid") && (d.delete(e.wid), t++)
                                                        })), console.log("[E2E_BUNDLE] ├─ Bundles válidos:", t), console.log("[E2E_BUNDLE] Processando key bundles...");
                                                        var s = (e = yield o("WAWebProcessKeyBundle").processKeyBundles([].concat(e))).depletedPrekeyCount,
                                                            a = e.processedPrekeyCount;
                                                        if (k += null != s ? s : 0, G += null != a ? a : 0, console.log("[E2E_BUNDLE] ├─ Processados:", a), console.log("[E2E_BUNDLE] ├─ Esgotados:", s), console.log("[E2E_BUNDLE] └─ Total acumulado:", G), a > 0) {
                                                            console.log("[E2E_BUNDLE] Atualizando status do cache para sessões estabelecidas...");
                                                            var r = 0;
                                                            e.forEach((function(e) {
                                                                if (e && e.wid) {
                                                                    var t = I.find((function(t) {
                                                                        return t.wid === e.wid.toString()
                                                                    }));
                                                                    t && (t.hasSession = !0, r++)
                                                                }
                                                            })), console.log("[E2E_BUNDLE] ✓", r, "entradas do cache marcadas como tendo sessão")
                                                        }
                                                    }));
                                                    return function(t) {
                                                        return e.apply(this, arguments)
                                                    }
                                                }(), p.PROCESS_KEY_BUNDLES, D), console.log("\n[E2E] ✅ PROCESSAMENTO DE BUNDLES CONCLUÍDO"), console.log("[E2E] Sessões estabelecidas:", G, "de", O.length), console.log("[E2E] Taxa de sucesso:", (G / O.length * 100).toFixed(2) + "%")
                                            } else console.log("[E2E] Modo foreground - busca direta de prekeys"), a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeys(O, s), k = null != (s = a.depletedPrekeyCount) ? s : 0, console.log("[E2E] ✓ Prekeys buscados"), console.log("[E2E] Prekeys esgotados:", k);
                                        else console.log("\n[E2E] ✓ TODOS OS WIDs JÁ POSSUEM SESSÃO"), console.log("[E2E] Nenhuma busca de prekey necessária")
                                    } else console.log("\n[E2E] ℹ️  NENHUM WID PARA PROCESSAR");
                                    console.log("\n[E2E] Resolvendo promessas..."), v.resolve(), console.log("[E2E] ✓ Promessas resolvidas")
                                } catch (e) {
                                    throw console.error("\n[E2E] ❌ ERRO NO PROCESSAMENTO"), console.error("[E2E] Erro:", e.message), console.error("[E2E] Stack:", e.stack), console.log("[E2E] Resolvendo promessas com erro..."), v.resolve(e), console.log("[E2E] Parando rastreamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    console.log("\n[E2E] 🧹 ETAPA 5/5: LIMPEZA E ATUALIZAÇÃO"), console.log("[E2E] Limpando estruturas de controle...");
                                    var H = 0;
                                    if (_.forEach((function(e) {
                                            l.delete(e), d.delete(e), H++
                                        })), console.log("[E2E] ✓", H, "WIDs limpos"), D && (console.log("[E2E] Removendo AbortController..."), u.delete(D), console.log("[E2E] ✓ AbortController removido")), I.length > 0 && h) {
                                        console.log("\n[E2E_CACHE] 💾 ATUALIZANDO CACHE"), console.log("[E2E_CACHE] Entradas para atualizar:", I.length);
                                        var F = I.filter((function(e) {
                                                return e.hasSession
                                            })).length,
                                            z = I.filter((function(e) {
                                                return !e.hasSession
                                            })).length;
                                        console.log("[E2E_CACHE] ├─ Com sessão:", F), console.log("[E2E_CACHE] └─ Sem sessão:", z);
                                        try {
                                            console.log("[E2E_CACHE] Salvando em lote..."), yield h.setBatch(I), console.log("[E2E_CACHE] ✅ Cache atualizado com sucesso"), console.log("[E2E_CACHE] Obtendo estatísticas finais..."), S = yield h.getStatistics(), console.log("[E2E_CACHE] 📈 ESTATÍSTICAS FINAIS:"), console.log(JSON.stringify(S, null, 2))
                                        } catch (e) {
                                            console.error("[E2E_CACHE] ❌ ERRO AO ATUALIZAR CACHE"), console.error("[E2E_CACHE] Erro:", e.message), m.errors++
                                        }
                                    } else console.log("\n[E2E_CACHE] ℹ️  Nenhuma atualização de cache necessária")
                                }
                                console.log("\n[E2E] 🔄 PROCESSANDO REQUISIÇÕES DEDUPADAS");
                                try {
                                    if (C.length > 0) {
                                        if (console.log("[E2E] Aguardando", C.length, "promessas dedupadas..."), a = (yield(i || (i = t("Promise"))).all(C)).find(Boolean)) throw console.log("[E2E] ⚠️  Erro encontrado em requisição dedupada"), a;
                                        console.log("[E2E] ✓ Todas as requisições dedupadas concluídas")
                                    } else console.log("[E2E] Nenhuma requisição dedupada para processar")
                                } catch (e) {
                                    throw console.error("[E2E] ❌ ERRO EM REQUISIÇÕES DEDUPADAS"), console.error("[E2E] Erro:", e.message), console.log("[E2E] Parando rastreamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    console.log("[E2E] Finalizando rastreamento de processamento..."), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), console.log("[E2E] ✓ Rastreamento finalizado")
                                }
                                return w = Date.now() - r, console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("[E2E] ✅ PROCESSO CONCLUÍDO COM SUCESSO"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"), console.log("\n[E2E] 📊 RESUMO DA EXECUÇÃO:"), console.log("[E2E] Total de WIDs processados:", e.length), console.log("[E2E] ├─ Sessões existentes:", _.length - U), console.log("[E2E] ├─ Prekeys solicitados:", U), console.log("[E2E] ├─ Prekeys esgotados:", k), console.log("[E2E] └─ Requisições dedupadas:", C.length), console.log("\n[E2E] 💾 ESTATÍSTICAS DO CACHE:"), console.log("[E2E] ├─ Cache hits:", m.hits), console.log("[E2E] ├─ Cache misses:", m.misses), console.log("[E2E] ├─ Sem sessão (cache):", m.withoutSession), console.log("[E2E] └─ Erros de cache:", m.errors), console.log("\n[E2E] ⏱️  PERFORMANCE:"), console.log("[E2E] Duração total:", w, "ms"), console.log("[E2E] Média por WID:", (w / e.length).toFixed(2), "ms"), console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"), {
                                    missedPrekeyCount: U,
                                    depletedPrekeyCount: k,
                                    processedPrekeyCount: _.length - U,
                                    cacheHits: m.hits,
                                    cacheMisses: m.misses,
                                    cacheWithoutSession: m.withoutSession,
                                    cacheErrors: m.errors,
                                    duration: w
                                }
                            })), h.apply(this, arguments)
                        }
                        r.ensureE2ESessions = g, r.ensureE2ESessionsWithDelay = function(e, t, n) {
                            void 0 === n && (n = !1);
                            var s = new(o("WAShiftTimer").ShiftTimer)((function() {
                                g(e, n)
                            }));
                            e.forEach((function(e) {
                                c.set(e, s)
                            })), s.onOrAfter(1e3 * t)
                        }
                    }), 98), __d("WAWebManageE2ESessionsJob_status", ["Promise", "WALogger", "WAResolvable", "WAShiftTimer", "WAWebAppTracker", "WAWebE2ESessionCache", "WAWebEventsWaitForOfflineDeliveryEnd", "WAWebFetchPrekeysJob_status", "WAWebManagePhoneNumberMappingJob", "WAWebProcessKeyBundle", "WAWebRunInBatches", "WAWebSignal", "WAWebWid", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i, c = new Map,
                            l = new Map,
                            d = new Set,
                            u = new Set,
                            p = {
                                SESSION_CHECK: 100,
                                PROCESS_KEY_BUNDLES: 5
                            };

                        function g(e, t, n) {
                            return h.apply(this, arguments)
                        }

                        function h() {
                            return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                void 0 === s && (s = !1), void 0 === a && (a = !1);
                                var r = Date.now();
                                console.log("[E2E] ensureE2ESessions:", e.length, "wids");
                                var g = o("WAWebE2ESessionCache").getCache(),
                                    h = {
                                        hits: 0,
                                        misses: 0,
                                        withoutSession: 0
                                    },
                                    m = e.length;
                                try {
                                    var W = e.map((function(e) {
                                            return e.toString()
                                        })),
                                        f = yield g.hasSessionBatch(W);
                                    h.hits = f.withSession.length, h.withoutSession = f.withoutSession.length, h.misses = f.uncached.length;
                                    var b = new Map;
                                    e.forEach((function(e) {
                                        b.set(e.toString(), e)
                                    }));
                                    var y = f.withSession.map((function(e) {
                                            return b.get(e)
                                        })).filter(Boolean),
                                        A = f.withoutSession.map((function(e) {
                                            return b.get(e)
                                        })).filter(Boolean),
                                        E = f.uncached.map((function(e) {
                                            return b.get(e)
                                        })).filter(Boolean);
                                    if (0 === E.length && 0 === A.length) return console.log("[E2E_CACHE] ✅ 100% cache hit (" + m + " wids)"), {
                                        missedPrekeyCount: 0,
                                        depletedPrekeyCount: 0,
                                        processedPrekeyCount: m,
                                        cacheHits: m,
                                        cacheMisses: 0,
                                        duration: Date.now() - r
                                    };
                                    if (0 === E.length && A.length > 0) return console.log("[E2E_CACHE] ⏭️  " + A.length + " wids sem sessão (cache válido, pulando)"), {
                                        missedPrekeyCount: 0,
                                        depletedPrekeyCount: 0,
                                        processedPrekeyCount: 0,
                                        cacheHits: y.length,
                                        cacheMisses: 0,
                                        cacheWithoutSession: A.length,
                                        duration: Date.now() - r
                                    };
                                    e = E, console.log("[E2E_CACHE] 📊 Cache: " + h.hits + " hits, " + h.withoutSession + " sem sessão (ignorados), " + h.misses + " misses → Processando " + e.length)
                                } catch (e) {
                                    console.warn("[E2E_CACHE] ⚠️  Cache error (continuando):", e.message)
                                }
                                if (0 === e.length) return {
                                    missedPrekeyCount: 0,
                                    depletedPrekeyCount: 0,
                                    processedPrekeyCount: 0,
                                    cacheHits: h.hits,
                                    cacheMisses: h.misses,
                                    cacheWithoutSession: h.withoutSession,
                                    duration: Date.now() - r
                                };
                                yield o("WAWebEventsWaitForOfflineDeliveryEnd").waitForOfflineDeliveryEnd(), o("WAWebAppTracker").AppTracker.start(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing);
                                try {
                                    yield o("WAWebManagePhoneNumberMappingJob").ensurePhoneNumberToLidMapping(e)
                                } catch (e) {
                                    console.warn("ensurePhoneNumberToLidMapping failed:", e)
                                }
                                var S = new(o("WAResolvable").Resolvable),
                                    w = [],
                                    v = [];
                                a || (u.forEach((function(e) {
                                    return e.abort()
                                })), d.forEach((function(e) {
                                    v.push(e), l.set(e, S.promise)
                                })), d.clear()), e.forEach((function(e) {
                                    if (e.isUserNotPSA()) {
                                        var t = c.get(e);
                                        t && (t.cancel(), c.delete(e)), (t = l.get(e)) ? w.push(t) : (v.push(e), l.set(e, S.promise))
                                    }
                                }));
                                var C = 0,
                                    _ = 0,
                                    T = null,
                                    M = [];
                                try {
                                    if (v.length > 0) {
                                        var P = [];
                                        a ? (T = new AbortController, u.add(T), v.forEach((function(e) {
                                            d.add(e)
                                        })), yield o("WAWebRunInBatches").runInBatches(v, function() {
                                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                var t;
                                                e = yield o("WAWebSignal").Session.hasSignalSessions(e), (t = P).push.apply(t, e)
                                            }));
                                            return function(t) {
                                                return e.apply(this, arguments)
                                            }
                                        }(), p.SESSION_CHECK, T)) : P = yield o("WAWebSignal").Session.hasSignalSessions(v);
                                        var x = [];
                                        if (v.forEach((function(e, t) {
                                                P[t] ? (d.delete(e), M.push({
                                                    wid: e.toString(),
                                                    hasSession: !0
                                                })) : (x.push(e), M.push({
                                                    wid: e.toString(),
                                                    hasSession: !1
                                                }))
                                            })), x.length > 0) {
                                            if (a) {
                                                a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeyBundles(x, s), a = o("WAWebFetchPrekeysJob_status").sortPrekeyBundles(a);
                                                var L = 0;
                                                yield o("WAWebRunInBatches").runInBatches(a, function() {
                                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                        var t;
                                                        e.forEach((function(e) {
                                                            (null == e ? void 0 : e.wid) instanceof n("WAWebWid") && d.delete(e.wid)
                                                        })), e = yield o("WAWebProcessKeyBundle").processKeyBundles([].concat(e)), _ += null != (t = e.depletedPrekeyCount) ? t : 0, L += null != (t = e.processedPrekeyCount) ? t : 0, e.processedPrekeyCount > 0 && e.forEach((function(e) {
                                                            if (e && e.wid) {
                                                                var t = M.find((function(t) {
                                                                    return t.wid === e.wid.toString()
                                                                }));
                                                                t && (t.hasSession = !0)
                                                            }
                                                        }))
                                                    }));
                                                    return function(t) {
                                                        return e.apply(this, arguments)
                                                    }
                                                }(), p.PROCESS_KEY_BUNDLES, T), console.log("[E2E] ✅ Established " + L + " sessions of " + x.length)
                                            } else a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeys(x, s), _ = null != (s = a.depletedPrekeyCount) ? s : 0;
                                            C = x.length
                                        }
                                    }
                                    S.resolve()
                                } catch (e) {
                                    throw console.warn("[E2E] Request failed:", e), S.resolve(e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    v.forEach((function(e) {
                                        l.delete(e), d.delete(e)
                                    })), T && u.delete(T), M.length > 0 && g && g.setBatch(M).catch((function(e) {
                                        console.warn("[E2E_CACHE] Update error (non-critical):", e.message)
                                    }))
                                }
                                try {
                                    if (a = (yield(i || (i = t("Promise"))).all(w)).find(Boolean)) throw a
                                } catch (e) {
                                    throw console.warn("[E2E] Deduped requests failed:", e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing)
                                }
                                var U = Date.now() - r;
                                return console.log("[E2E] ✅ " + m + " wids: " + (v.length - C) + " existing, " + C + " requested, " + w.length + " deduped, " + U + "ms (cache: " + h.hits + " hits)"), {
                                    missedPrekeyCount: C,
                                    depletedPrekeyCount: _,
                                    processedPrekeyCount: v.length - C,
                                    cacheHits: h.hits,
                                    cacheMisses: h.misses,
                                    cacheWithoutSession: h.withoutSession,
                                    duration: U
                                }
                            })), h.apply(this, arguments)
                        }
                        r.ensureE2ESessions = g, r.ensureE2ESessionsWithDelay = function(e, t, n) {
                            void 0 === n && (n = !1);
                            var s = new(o("WAShiftTimer").ShiftTimer)((function() {
                                g(e, n)
                            }));
                            e.forEach((function(e) {
                                c.set(e, s)
                            })), s.onOrAfter(1e3 * t)
                        }
                    }), 98), __d("WAWebManageE2ESessionsJob_direct_old", ["Promise", "WALogger", "WAResolvable", "WAShiftTimer", "WAWebAppTracker", "WAWebEventsWaitForOfflineDeliveryEnd", "WAWebFetchPrekeysJob_status", "WAWebManagePhoneNumberMappingJob", "WAWebProcessKeyBundle", "WAWebRunInBatches", "WAWebSignal", "WAWebSignalCommonUtils", "WAWebWid", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i, c, l = new Map,
                            d = new Map,
                            u = new Set,
                            p = new Set,
                            g = {
                                SESSION_CHECK: 100,
                                PROCESS_KEY_BUNDLES: 5
                            };

                        function h(e, t, n) {
                            return m.apply(this, arguments)
                        }

                        function m() {
                            return m = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                void 0 === s && (s = !1), void 0 === a && (a = !1);
                                var r = Date.now();
                                console.log("[E2E] ensureE2ESessions:", e.length, "wids");
                                var h, m = yield(h = e, new(i || (i = t("Promise")))((function(e, t) {
                                    if (h && 0 !== h.length) {
                                        console.log("[DIRECT_CACHE] Consultando signal-storage para", h.length, "WIDs");
                                        var n = indexedDB.open("signal-storage");
                                        n.onerror = function() {
                                            console.error("[DIRECT_CACHE] Erro ao abrir signal-storage:", n.error), e({
                                                withSession: [],
                                                uncached: h
                                            })
                                        }, n.onsuccess = function(t) {
                                            var n = t.target.result;
                                            if (!n.objectStoreNames.contains("session-store")) return console.error("[DIRECT_CACHE] Store 'session-store' não encontrada!"), void e({
                                                withSession: [],
                                                uncached: h
                                            });
                                            var s = n.transaction("session-store", "readonly").objectStore("session-store"),
                                                a = {
                                                    withSession: [],
                                                    uncached: []
                                                },
                                                r = 0,
                                                i = h.length,
                                                c = o("WAWebSignalCommonUtils");
                                            o("WAWebWidFactory"), h.forEach((function(t, n) {
                                                try {
                                                    var o = c.createSignalAddress(t).toString(),
                                                        l = s.get(o);
                                                    l.onsuccess = function() {
                                                        var n = l.result;
                                                        n && n.session ? a.withSession.push(t) : a.uncached.push(t), ++r % 500 != 0 && r !== i || console.log("[DIRECT_CACHE] Progresso:", r + "/" + i, "- Com sessão:", a.withSession.length), r === i && (console.log("[DIRECT_CACHE] ✅ Concluído - Com sessão:", a.withSession.length, "Sem sessão:", a.uncached.length), e(a))
                                                    }, l.onerror = function() {
                                                        console.warn("[DIRECT_CACHE] Erro ao buscar:", t.toString()), a.uncached.push(t), ++r === i && e(a)
                                                    }
                                                } catch (n) {
                                                    console.error("[DIRECT_CACHE] Erro ao processar WID:", t.toString(), n), a.uncached.push(t), ++r === i && e(a)
                                                }
                                            }))
                                        }
                                    } else e({
                                        withSession: [],
                                        uncached: []
                                    })
                                }))), W = m.withSession, f = m.uncached;
                                if (0 === f.length) return console.log("[E2E] ✅ Todos os", e.length, "WIDs já têm sessão (100% cache hit)"), {
                                    missedPrekeyCount: 0,
                                    depletedPrekeyCount: 0,
                                    processedPrekeyCount: e.length,
                                    duration: Date.now() - r
                                };
                                console.log("[E2E] Cache hit:", W.length + "/" + e.length, "(" + (W.length / e.length * 100).toFixed(1) + "%)"), console.log("[E2E] Processando", f.length, "WIDs sem sessão"), e = f, yield o("WAWebEventsWaitForOfflineDeliveryEnd").waitForOfflineDeliveryEnd(), o("WAWebAppTracker").AppTracker.start(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing);
                                try {
                                    yield o("WAWebManagePhoneNumberMappingJob").ensurePhoneNumberToLidMapping(e)
                                } catch (e) {
                                    console.warn("ensurePhoneNumberToLidMapping failed:", e)
                                }
                                var b = new(o("WAResolvable").Resolvable),
                                    y = [],
                                    A = [];
                                a || (p.forEach((function(e) {
                                    return e.abort()
                                })), u.forEach((function(e) {
                                    A.push(e), d.set(e, b.promise)
                                })), u.clear()), e.forEach((function(e) {
                                    if (e.isUserNotPSA()) {
                                        var t = l.get(e);
                                        t && (t.cancel(), l.delete(e)), (t = d.get(e)) ? y.push(t) : (A.push(e), d.set(e, b.promise))
                                    }
                                }));
                                var E = 0,
                                    S = 0,
                                    w = null;
                                try {
                                    if (A.length > 0) {
                                        var v = [];
                                        a ? (w = new AbortController, p.add(w), A.forEach((function(e) {
                                            u.add(e)
                                        })), yield o("WAWebRunInBatches").runInBatches(A, function() {
                                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                var t;
                                                e = yield o("WAWebSignal").Session.hasSignalSessions(e), (t = v).push.apply(t, e)
                                            }));
                                            return function(t) {
                                                return e.apply(this, arguments)
                                            }
                                        }(), g.SESSION_CHECK, w)) : v = yield o("WAWebSignal").Session.hasSignalSessions(A);
                                        var C = [];
                                        if (A.forEach((function(e, t) {
                                                v[t] ? u.delete(e) : C.push(e)
                                            })), C.length > 0) {
                                            if (a) {
                                                a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeyBundles(C, s), a = o("WAWebFetchPrekeysJob_status").sortPrekeyBundles(a);
                                                var _ = 0;
                                                yield o("WAWebRunInBatches").runInBatches(a, function() {
                                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                        var t;
                                                        e.forEach((function(e) {
                                                            (null == e ? void 0 : e.wid) instanceof n("WAWebWid") && u.delete(e.wid)
                                                        })), e = yield o("WAWebProcessKeyBundle").processKeyBundles([].concat(e)), S += null != (t = e.depletedPrekeyCount) ? t : 0, _ += null != (t = e.processedPrekeyCount) ? t : 0
                                                    }));
                                                    return function(t) {
                                                        return e.apply(this, arguments)
                                                    }
                                                }(), g.PROCESS_KEY_BUNDLES, w), console.log("[E2E] ✅ Established " + _ + " sessions of " + C.length)
                                            } else a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeys(C, s), S = null != (s = a.depletedPrekeyCount) ? s : 0;
                                            E = C.length
                                        }
                                    }
                                    b.resolve()
                                } catch (e) {
                                    throw console.warn("[E2E] Request failed:", e), b.resolve(e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    A.forEach((function(e) {
                                        d.delete(e), u.delete(e)
                                    })), w && p.delete(w)
                                }
                                try {
                                    if (a = (yield(c || (c = t("Promise"))).all(y)).find(Boolean)) throw a
                                } catch (e) {
                                    throw console.warn("[E2E] Deduped requests failed:", e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing)
                                }
                                var T = Date.now() - r,
                                    M = W.length + (A.length - E);
                                return console.log("[E2E] ✅ Concluído:", e.length + W.length, "WIDs totais,", W.length, "cached,", A.length - E, "existing,", E, "requested,", y.length, "deduped,", T + "ms"), {
                                    missedPrekeyCount: E,
                                    depletedPrekeyCount: S,
                                    processedPrekeyCount: M,
                                    duration: T
                                }
                            })), m.apply(this, arguments)
                        }
                        r.ensureE2ESessions = h, r.ensureE2ESessionsWithDelay = function(e, t, n) {
                            void 0 === n && (n = !1);
                            var s = new(o("WAShiftTimer").ShiftTimer)((function() {
                                h(e, n)
                            }));
                            e.forEach((function(e) {
                                l.set(e, s)
                            })), s.onOrAfter(1e3 * t)
                        }
                    }), 98), __d("WAWebManageE2ESessionsJob_direct", ["Promise", "WALogger", "WAResolvable", "WAShiftTimer", "WAWebAppTracker", "WAWebEventsWaitForOfflineDeliveryEnd", "WAWebFetchPrekeysJob_status", "WAWebManagePhoneNumberMappingJob", "WAWebProcessKeyBundle", "WAWebRunInBatches", "WAWebSignal", "WAWebSignalCommonUtils", "WAWebWid", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                        var i, c = new Map,
                            l = new Map,
                            d = new Set,
                            u = new Set,
                            p = {
                                SESSION_CHECK: 100,
                                PROCESS_KEY_BUNDLES: 5
                            },
                            g = {
                                ALWAYS_REFRESH: !0,
                                MEMORY_CACHE_TTL_MS: 6e4,
                                BATCH_SIZE: 500,
                                BATCH_DELAY_MS: 0,
                                ENABLE_DEBUG_LOGS: !0
                            },
                            h = new Map;

                        function m() {
                            var e = Date.now(),
                                t = [];
                            h.forEach((function(n, o) {
                                e - n.timestamp > g.MEMORY_CACHE_TTL_MS && t.push(o)
                            })), t.forEach((function(e) {
                                h.delete(e)
                            })), t.length > 0 && g.ENABLE_DEBUG_LOGS && console.log("[MEMORY_CACHE] Limpou", t.length, "entradas expiradas")
                        }

                        function W(e, t, n) {
                            return f.apply(this, arguments)
                        }

                        function f() {
                            return f = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                void 0 === s && (s = !1), void 0 === a && (a = !1);
                                var r = Date.now();
                                console.log("[E2E] ensureE2ESessions:", e.length, "wids"), m();
                                var W = [],
                                    f = [],
                                    b = [];
                                if (e.forEach((function(e) {
                                        if (g.ALWAYS_REFRESH && function(e) {
                                                var t = e.toString(),
                                                    n = h.get(t);
                                                return !(!n || Date.now() - n.timestamp > g.MEMORY_CACHE_TTL_MS && (h.delete(t), 1))
                                            }(e)) {
                                            var t = function(e) {
                                                var t = e.toString(),
                                                    n = h.get(t);
                                                return n ? n.promise : null
                                            }(e);
                                            if (t) return f.push(e), b.push(t), void(g.ENABLE_DEBUG_LOGS && f.length % 100 == 0 && console.log("[MEMORY_CACHE] Hit:", f.length, "WIDs em processamento"))
                                        }
                                        W.push(e)
                                    })), g.ENABLE_DEBUG_LOGS && console.log("[E2E] Strategy:", "\n  - Total WIDs:", e.length, "\n  - Em processamento (memory cache):", f.length, "\n  - Novos para processar:", W.length), 0 === W.length && b.length > 0) {
                                    console.log("[E2E] ⏳ Todos os WIDs já estão sendo processados, aguardando...");
                                    try {
                                        yield(i || (i = t("Promise"))).all(b)
                                    } catch (e) {
                                        console.warn("[E2E] Erro ao aguardar cache de memória:", e)
                                    }
                                    return {
                                        missedPrekeyCount: 0,
                                        depletedPrekeyCount: 0,
                                        processedPrekeyCount: e.length,
                                        memoryCacheHits: f.length,
                                        duration: Date.now() - r
                                    }
                                }
                                e = W, g.ENABLE_DEBUG_LOGS && console.log("[E2E] 🔄 Forçando refresh de", e.length, "sessões (ignorando IndexedDB cache)"), yield o("WAWebEventsWaitForOfflineDeliveryEnd").waitForOfflineDeliveryEnd(), o("WAWebAppTracker").AppTracker.start(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing);
                                try {
                                    yield o("WAWebManagePhoneNumberMappingJob").ensurePhoneNumberToLidMapping(e)
                                } catch (e) {
                                    console.warn("ensurePhoneNumberToLidMapping failed:", e)
                                }
                                var y = new(o("WAResolvable").Resolvable),
                                    A = [],
                                    E = [];
                                e.forEach((function(e) {
                                    ! function(e, t) {
                                        var n = e.toString();
                                        h.set(n, {
                                            timestamp: Date.now(),
                                            promise: t
                                        })
                                    }(e, y.promise)
                                })), a || (u.forEach((function(e) {
                                    return e.abort()
                                })), d.forEach((function(e) {
                                    E.push(e), l.set(e, y.promise)
                                })), d.clear()), e.forEach((function(e) {
                                    if (e.isUserNotPSA()) {
                                        var t = c.get(e);
                                        t && (t.cancel(), c.delete(e)), (t = l.get(e)) ? A.push(t) : (E.push(e), l.set(e, y.promise))
                                    }
                                }));
                                var S = 0,
                                    w = 0,
                                    v = null;
                                try {
                                    if (E.length > 0) {
                                        var C = [];
                                        a ? (v = new AbortController, u.add(v), E.forEach((function(e) {
                                            d.add(e)
                                        })), console.log("[E2E] ⚡ Modo agressivo: forçando prekeys para TODOS os", E.length, "WIDs"), C = E.map((function() {
                                            return !1
                                        }))) : C = yield o("WAWebSignal").Session.hasSignalSessions(E);
                                        var _ = [];
                                        if (E.forEach((function(e, t) {
                                                C[t] ? d.delete(e) : _.push(e)
                                            })), _.length > 0) {
                                            if (g.ENABLE_DEBUG_LOGS && console.log("[E2E] 🔑 Buscando prekeys para", _.length, "WIDs"), a) {
                                                a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeyBundles(_, s), a = o("WAWebFetchPrekeysJob_status").sortPrekeyBundles(a);
                                                var T = 0;
                                                yield o("WAWebRunInBatches").runInBatches(a, function() {
                                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                        var t;
                                                        e.forEach((function(e) {
                                                            (null == e ? void 0 : e.wid) instanceof n("WAWebWid") && d.delete(e.wid)
                                                        })), e = yield o("WAWebProcessKeyBundle").processKeyBundles([].concat(e)), w += null != (t = e.depletedPrekeyCount) ? t : 0, T += null != (t = e.processedPrekeyCount) ? t : 0
                                                    }));
                                                    return function(t) {
                                                        return e.apply(this, arguments)
                                                    }
                                                }(), p.PROCESS_KEY_BUNDLES, v), console.log("[E2E] ✅ Established " + T + " sessions of " + _.length)
                                            } else a = yield o("WAWebFetchPrekeysJob_status").fetchPrekeys(_, s), w = null != (s = a.depletedPrekeyCount) ? s : 0;
                                            S = _.length
                                        }
                                    }
                                    y.resolve()
                                } catch (e) {
                                    throw console.warn("[E2E] Request failed:", e), y.resolve(e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    E.forEach((function(e) {
                                        l.delete(e), d.delete(e)
                                    })), v && u.delete(v)
                                }
                                try {
                                    if (a = (yield(i || (i = t("Promise"))).all(A)).find(Boolean)) throw a
                                } catch (e) {
                                    throw console.warn("[E2E] Deduped requests failed:", e), o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing), e
                                } finally {
                                    o("WAWebAppTracker").AppTracker.stop(o("WAWebAppTracker").AppTrackerType.PreKeyProcessing)
                                }
                                var M = Date.now() - r,
                                    P = E.length - S + f.length;
                                return console.log("[E2E] ✅ Concluído:", "\n  - Total WIDs:", e.length + f.length, "\n  - Memory cache hits:", f.length, "\n  - Novos processados:", E.length - S, "\n  - Prekeys requisitados:", S, "\n  - Deduped:", A.length, "\n  - Duração:", M + "ms"), {
                                    missedPrekeyCount: S,
                                    depletedPrekeyCount: w,
                                    processedPrekeyCount: P,
                                    memoryCacheHits: f.length,
                                    duration: M
                                }
                            })), f.apply(this, arguments)
                        }
                        setInterval(m, 3e4), r.ensureE2ESessions = W, r.ensureE2ESessionsWithDelay = function(e, t, n) {
                            void 0 === n && (n = !1);
                            var s = new(o("WAShiftTimer").ShiftTimer)((function() {
                                W(e, n)
                            }));
                            e.forEach((function(e) {
                                c.set(e, s)
                            })), s.onOrAfter(1e3 * t)
                        }, r.REFRESH_CONFIG = g, r.memoryCache = h
                    }), 98), __d("WAWebFetchPrekeysJob_status", ["WAJids", "WALogger", "WAParsableXmlNode", "WASmaxPreKeysFetchKeyBundlesRPC", "WAWebBackendErrors", "WAWebProcessKeyBundle", "WAWebWidFactory", "WAWebWidToJid", "asyncToGeneratorRuntime", "err"], (function(e, t, n, o, s, a, r) {
                        var i, c = {
                            totalFetchRequests: 0,
                            successfulFetches: 0,
                            failedFetches: 0,
                            serverErrors: 0,
                            requestErrors: 0,
                            emptyResponses: 0,
                            processedBundles: 0,
                            depletedPrekeys: 0,
                            establishedSessions: 0,
                            errorsByType: {},
                            lastError: null,
                            lastErrorTime: null
                        };

                        function l(e, t) {
                            c.failedFetches++, c.lastError = t, c.lastErrorTime = Date.now(), c.errorsByType[e] || (c.errorsByType[e] = 0), c.errorsByType[e]++
                        }

                        function d() {
                            return d = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t) {
                                void 0 === t && (t = !1), c.totalFetchRequests++;
                                var n = Date.now();
                                console.log("[FETCH_PREKEYS] Iniciando fetch de prekeys para", e.length, "wids");
                                try {
                                    var s = yield u(e, t), a = yield o("WAWebProcessKeyBundle").processKeyBundles(s), r = a.depletedPrekeyCount || 0, d = a.processedPrekeyCount || 0;
                                    c.successfulFetches++, c.depletedPrekeys += r, c.establishedSessions += d, c.processedBundles += s.length;
                                    var p = Date.now() - n;
                                    return console.log("[FETCH_PREKEYS] ✅ Sucesso: " + d + " sessões de " + e.length + " requisitadas em " + p + "ms"), console.log(i || (i = babelHelpers.taggedTemplateLiteralLoose(["fetchPrekeys: successfully established ", " E2E sessions out of ", " requested"])), d, e.length), r > 0 && console.log("[FETCH_PREKEYS] ⚠️  Prekeys esgotadas:", r), {
                                        depletedPrekeyCount: r,
                                        processedPrekeyCount: d,
                                        duration: p
                                    }
                                } catch (e) {
                                    p = Date.now() - n;
                                    var g = e.message || String(e);
                                    return console.error("[FETCH_PREKEYS] ❌ Erro ao buscar prekeys:", g), console.error("[FETCH_PREKEYS] Stack:", e.stack), l("fetchPrekeys", g), {
                                        depletedPrekeyCount: 0,
                                        processedPrekeyCount: 0,
                                        duration: p,
                                        error: g
                                    }
                                }
                            })), d.apply(this, arguments)
                        }

                        function u(e, t) {
                            return p.apply(this, arguments)
                        }

                        function p() {
                            return p = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t) {
                                void 0 === t && (t = !1), console.log("[FETCH_BUNDLES] Buscando key bundles para", e.length, "usuários");
                                try {
                                    var s = yield o("WASmaxPreKeysFetchKeyBundlesRPC").sendFetchKeyBundlesRPC({
                                        userArgs: e.map((function(e) {
                                            return {
                                                userJid: o("WAWebWidToJid").widToDeviceJid(e),
                                                hasUserReasonIdentity: t
                                            }
                                        }))
                                    });
                                    if ("FetchKeyBundlesResponseServerError" === s.name) {
                                        var a = s.value.errorServerErrors.value,
                                            r = "Server error: " + a.code + " " + a.text;
                                        throw console.error("[FETCH_BUNDLES] ❌ Erro do servidor:", r), c.serverErrors++, l("ServerError", r), new(o("WAWebBackendErrors").ServerStatusCodeError)(Number(a.code), "fetchPrekeys: " + r)
                                    }
                                    if ("FetchKeyBundlesResponseRequestError" === s.name) {
                                        var i = s.value.errorRequestErrorsFetch.value;
                                        throw r = "Request error: " + i.code + " " + i.text, console.error("[FETCH_BUNDLES] ❌ Erro de requisição:", r), c.requestErrors++, l("RequestError", r), new(o("WAWebBackendErrors").ServerStatusCodeError)(Number(i.code), "fetchPrekeys: " + r)
                                    }
                                    var d = s.value.listUser || [];
                                    if (0 === d.length) throw console.warn("[FETCH_BUNDLES] ⚠️  Resposta vazia - nenhum key bundle retornado"), c.emptyResponses++, l("EmptyResponse", "No key bundles returned"), n("err")("fetchPrekeys: empty key info");
                                    console.log("[FETCH_BUNDLES] Processando", d.length, "respostas de usuários");
                                    var u = d.map((function(e) {
                                            try {
                                                var t = e.userFetchKeyBundlesSuccessOrFetchKeyBundlesErrorOrFetchKeyBundlesErrorFallbackMixinGroup;
                                                switch (t.name) {
                                                    case "FetchKeyBundlesUserSuccess":
                                                        var s = t.value,
                                                            a = s.preKeyMixin,
                                                            r = s.elementValue,
                                                            i = s.deviceIdentityMixin,
                                                            c = s.skeyIdKeyIDMixin,
                                                            d = s.skeyValueKeyDataMixin,
                                                            u = s.skeySignatureElementValue,
                                                            p = s.registrationElementValue;
                                                        return {
                                                            deviceIdentity: null != (null == i ? void 0 : i.deviceIdentityElementValue) ? i.deviceIdentityElementValue : null, identity: r, skey: {
                                                                id: o("WAParsableXmlNode").convertBytesToUint(c.elementValue, 3),
                                                                pubkey: d.elementValue,
                                                                signature: u
                                                            }, key: a ? {
                                                                id: o("WAParsableXmlNode").convertBytesToUint(a.keyIdKeyIDMixin.elementValue, 3),
                                                                pubkey: null == a.keyValueKeyDataMixin ? void 0 : a.keyValueKeyDataMixin.elementValue
                                                            } : null, regId: o("WAParsableXmlNode").convertBytesToUint(p, 4), wid: o("WAWebWidFactory").createWid(e.jid)
                                                        };
                                                    case "FetchKeyBundlesUserErrorFallback":
                                                    case "FetchKeyBundlesUserError":
                                                        var g = t.value,
                                                            h = g.errorCode,
                                                            m = g.errorText,
                                                            W = "User error: " + h + " " + m;
                                                        return console.warn("[FETCH_BUNDLES] ⚠️  Erro no item da lista:", W), l("UserItemError", W), n("err")("fetchPrekeys: list item error: " + h + " " + m);
                                                    default:
                                                        return console.warn("[FETCH_BUNDLES] ⚠️  Tipo de resposta desconhecido:", t.name), n("err")("fetchPrekeys: unknown response type: " + t.name)
                                                }
                                            } catch (e) {
                                                return console.error("[FETCH_BUNDLES] ❌ Erro ao processar item:", e.message), l("ItemProcessing", e.message), e
                                            }
                                        })),
                                        p = u.filter((function(e) {
                                            return !(e instanceof Error)
                                        })).length,
                                        g = u.filter((function(e) {
                                            return e instanceof Error
                                        })).length;
                                    return console.log("[FETCH_BUNDLES] ✅ Processamento concluído: " + p + " sucesso, " + g + " erros"), u
                                } catch (e) {
                                    throw console.error("[FETCH_BUNDLES] ❌ Erro fatal ao buscar bundles:", e.message), console.error("[FETCH_BUNDLES] Stack:", e.stack), "ServerStatusCodeError" !== e.name && l("FatalError", e.message), e
                                }
                            })), p.apply(this, arguments)
                        }
                        r.fetchPrekeys = function(e, t) {
                            return d.apply(this, arguments)
                        }, r.fetchPrekeyBundles = u, r.sortPrekeyBundles = function(e) {
                            console.log("[SORT_BUNDLES] Ordenando", e.length, "bundles");
                            try {
                                var t = [],
                                    n = [],
                                    s = [];
                                return e.forEach((function(e) {
                                    e instanceof Error ? s.push(e) : null != e.wid.device && e.wid.device !== o("WAJids").DEFAULT_DEVICE_ID ? n.push(e) : t.push(e)
                                })), console.log("[SORT_BUNDLES] Resultado: " + t.length + " regulares, " + n.length + " companion, " + s.length + " erros"), [].concat(t, n, s)
                            } catch (t) {
                                return console.error("[SORT_BUNDLES] ❌ Erro ao ordenar bundles:", t.message), l("SortError", t.message), e
                            }
                        }, r.getModuleStatistics = function() {
                            var e = c.totalFetchRequests,
                                t = e > 0 ? (c.successfulFetches / e * 100).toFixed(2) : 0;
                            return {
                                totalFetchRequests: c.totalFetchRequests,
                                successfulFetches: c.successfulFetches,
                                failedFetches: c.failedFetches,
                                successRate: t + "%",
                                serverErrors: c.serverErrors,
                                requestErrors: c.requestErrors,
                                emptyResponses: c.emptyResponses,
                                processedBundles: c.processedBundles,
                                depletedPrekeys: c.depletedPrekeys,
                                establishedSessions: c.establishedSessions,
                                errorsByType: Object.assign({}, c.errorsByType),
                                lastError: c.lastError,
                                lastErrorTime: c.lastErrorTime
                            }
                        }
                    }), 98),
                    function() {
                        console.log("🔧 Instalando patch CONSERVADOR (comportamento WhatsApp)...");
                        const e = window.require("WAWebUserPrefsStatus"),
                            t = window.require("WAWebUserPrefsIndexedDBStorage"),
                            n = window.require("WAWebUserPrefsKeys"),
                            o = {
                                ENABLE_TIME_VALIDATION: !1,
                                ENABLE_PARTIAL_REFRESH: !1,
                                PARTIAL_REFRESH_PERCENT: 2,
                                ENABLE_PERIODIC_FULL_REFRESH: !0,
                                FULL_REFRESH_DAYS: 30,
                                ENABLE_DEBUG_LOGS: !0
                            };
                        let s = parseInt(localStorage.getItem("lastStatusSKRefresh") || "0"),
                            a = !1;
                        const r = e.getStatusSkDistribList;
                        e.getStatusSkDistribList = async function(e) {
                            o.ENABLE_DEBUG_LOGS && console.log("🔍 [SK] getStatusSkDistribList:", e.length, "participantes");
                            const i = Date.now();
                            if (o.ENABLE_PERIODIC_FULL_REFRESH) {
                                const e = (i - s) / 864e5;
                                e >= o.FULL_REFRESH_DAYS && !a && (console.log("🔄 [SK] REFRESH PERIÓDICO:", e.toFixed(1), "dias"), console.log("⚡ [SK] Forçando rotateKey (igual a identity change)"), await t.userPrefsIdb.set(n.BACKEND_ONLY_KEYS.STATUS_SENDER_KEY, {
                                    rotateKey: !0,
                                    senderKey: new Set
                                }), a = !0, s = i, localStorage.setItem("lastStatusSKRefresh", i.toString()))
                            }
                            const c = await r.call(this, e);
                            if (o.ENABLE_DEBUG_LOGS && console.log("📊 [SK] Resultado original:", {
                                    rotateKey: c.rotateKey,
                                    skDistribList: c.skDistribList?.length || 0,
                                    participantList: c.participantList?.length || 0
                                }), c.rotateKey) return a = !1, console.log("✅ [SK] rotateKey ATIVO"), c;
                            if (o.ENABLE_PARTIAL_REFRESH && c.participantList && c.participantList.length > 0) {
                                const e = Math.max(1, Math.ceil(c.participantList.length * (o.PARTIAL_REFRESH_PERCENT / 100))),
                                    t = c.participantList.sort((() => Math.random() - .5)).slice(0, e);
                                t.length > 0 && (console.log("🎲 [SK] Refresh mínimo:", t.length, "contatos (" + o.PARTIAL_REFRESH_PERCENT + "%)"), c.skDistribList = [...c.skDistribList, ...t], c.participantList = c.participantList.filter((e => !t.some((t => t.equals(e))))))
                            }
                            return o.ENABLE_DEBUG_LOGS && console.log("✅ [SK] Resultado final:", {
                                skDistribList: c.skDistribList?.length || 0,
                                participantList: c.participantList?.length || 0
                            }), c
                        };
                        const i = e.markStatusSenderKeyRotate;
                        e.markStatusSenderKeyRotate = async function(e) {
                            return console.log("🔄 [SK] markStatusSenderKeyRotate (identity change):", e.length, "contatos"), a = !0, i.call(this, e)
                        };
                        const c = e.markForgetStatusSenderKey;
                        e.markForgetStatusSenderKey = async function(e) {
                            return console.log("🗑️  [SK] markForgetStatusSenderKey (retry):", e.length, "contatos"), c.call(this, e)
                        }, window.statusSK = {
                            status: function() {
                                const e = (Date.now() - s) / 864e5,
                                    t = o.FULL_REFRESH_DAYS - e;
                                console.log("📊 Status Sender Keys (Modo Conservador):"), console.log("  - Último refresh:", e.toFixed(1), "dias atrás"), console.log("  - Próximo refresh:", t > 0 ? t.toFixed(1) + " dias" : "AGORA"), console.log("  - Rotação pendente:", a ? "SIM" : "NÃO"), console.log("\n⚙️  Configuração:"), console.log("  - Refresh parcial:", o.PARTIAL_REFRESH_PERCENT + "% por envio"), console.log("  - Refresh periódico:", o.FULL_REFRESH_DAYS + " dias"), console.log("\n✅ Gatilhos automáticos do WhatsApp:"), console.log("  - Identity change → rotateKey"), console.log("  - Retry de mensagem → forget sender key"), console.log("  - Inconsistência cache → rotateKey")
                            },
                            forceRefresh: async function() {
                                console.log("🔄 Forçando refresh..."), s = 0, localStorage.setItem("lastStatusSKRefresh", "0"), a = !1, console.log("✅ Próximo envio fará refresh total")
                            },
                            config: o
                        }, console.log("✅ Patch CONSERVADOR instalado!"), console.log("📋 Comportamento:"), console.log("  - Confia nos gatilhos do WhatsApp (identity change, retry)"), console.log("  - Refresh mínimo: 2% por envio (~280 de 14k)"), console.log("  - Refresh total: a cada 30 dias (segurança extra)"), console.log("📊 Use: statusSK.status()")
                    }(),
                    function() {
                        if (__d("WAWebEncryptAndSendStatusMsg_", ["WADeprecatedSendIq", "WAJids", "WALogger", "WANullthrows", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiContact", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebDBDeviceListFanout", "WAWebE2EProtoUtils", "WAWebGetGroupKeyDistributionMsg", "WAWebLidMigrationUtils", "WAWebLidStatusMigrationGating", "WAWebLidStatusMigrationUtils", "WAWebManageE2ESessionsJob", "WAWebMsgFanoutTypes", "WAWebMsgKey", "WAWebPostPrekeysDepletionMetric", "WAWebProtobufsE2E.pb", "WAWebReportingTokenUtils", "WAWebSchemaMessageInfo", "WAWebSendMsgCommonApi", "WAWebSendMsgCreateFanoutStanza", "WAWebSignal", "WAWebSignalProtocolStore", "WAWebUserPrefsMeUser", "WAWebUserPrefsStatus", "WAWebUserPrefsStatusType", "WAWebWamEnumMessageDistributionEnumType", "WAWebWamEnumMessageType", "WAWebWamEnumPrekeysFetchContext", "WAWebWamNumberToSizeBucket", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                                var i, c, l, d, u, p, g, h, m, W;

                                function f(e) {
                                    return b.apply(this, arguments)
                                }

                                function b() {
                                    return b = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        var t = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e));
                                        return 0 === t.length && (t = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(o("WAWebLidMigrationUtils").getAlternateMsgKey(e)))), t.map((function(e) {
                                            return o("WAWebLidStatusMigrationUtils").matWidConvert(o("WAWebWidFactory").createWid(e.receiverUserJid))
                                        }))
                                    })), b.apply(this, arguments)
                                }

                                function y() {
                                    return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, s) {
                                        var a, r, m = e.data.id,
                                            W = o("WAWebLidStatusMigrationGating").getLidStatusSendEnabled(),
                                            b = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID),
                                            y = W ? n("WANullthrows")(o("WAWebUserPrefsMeUser").getMaybeMeDeviceLid()) : o("WAWebUserPrefsMeUser").getMeDevicePnOrThrow(),
                                            E = function(e) {
                                                var t = null;
                                                if ((null == (e = e.protocolMessage) ? void 0 : e.type) === o("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && null != e && e.key) {
                                                    var s = (e = e.key).remoteJid,
                                                        a = e.id;
                                                    e = e.participant, null != s && null != a && null != e && (t = new(n("WAWebMsgKey"))({
                                                        remote: o("WAWebWidFactory").createWid(s),
                                                        fromMe: !0,
                                                        id: a,
                                                        participant: o("WAWebWidFactory").createWid(e)
                                                    }))
                                                }
                                                return t
                                            }(t),
                                            v = yield n("WAWebUserPrefsStatus").getStatusList();
                                        if (W && (v.list = v.list.map((function(e) {
                                                return o("WAWebApiContact").getCurrentLid(o("WAWebWidFactory").asUserWidOrThrow(e))
                                            })).filter(Boolean).map((function(e) {
                                                return e
                                            }))), o("WALogger").LOG(i || (i = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: start to send ", ", revoke: ", ""])), m.id, E).devConsole(t), E) {
                                            if (null == (W = s.sendPerfReporter) || W.setIsRevokeMessage(!0), function(e, t) {
                                                    var n = new Set(t.map((function(e) {
                                                        return o("WAWebWidFactory").asUserWidOrThrow(e).toString()
                                                    })));
                                                    return e.some((function(e) {
                                                        return !o("WAWebUserPrefsMeUser").isMeAccount(e) && !n.has(o("WAWebWidFactory").asUserWidOrThrow(e).toString())
                                                    }))
                                                }(W = yield f(E), v.list)) return o("WALogger").LOG(c || (c = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: start to send direct revoke message"]))), w(e, t, E = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                                wids: [].concat(W, [y])
                                            }), s);
                                            E = W
                                        } else {
                                            if (0 === v.list.length) return;
                                            E = v.list, a = o("WAWap").wap("meta", {
                                                status_setting: S(v.setting)
                                            })
                                        }
                                        if (W = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                                wids: [].concat(E, [y])
                                            }), o("WALogger").LOG(l || (l = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: all device list size ", ""])), W.length), E = (v = yield n("WAWebUserPrefsStatus").getStatusSkDistribList(W)).skDistribList, v = v.participantList, E.length > 0 && (o("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: distribute ", " sender key"])), E.length), null == (r = s.sendReporter) || r.setMessageDistributionType(o("WAWebWamEnumMessageDistributionEnumType").MESSAGE_DISTRIBUTION_ENUM_TYPE.SENDER_KEY_DISTRIBUTION_MESSAGE), null == (r = s.sendReporter) || r.setDeviceCount(E.length), null == (r = s.sendPerfReporter) || r.setSenderKeyDistributionCount(E.length)), yield o("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(W.map((function(e) {
                                                return {
                                                    msgKey: m,
                                                    receiverId: e
                                                }
                                            }))), o("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: create receipts records"]))), E.length > 0) try {
                                            var C;
                                            null == (r = s.sendPerfReporter) || r.startPrekeysFetchStage(), r = yield o("WAWebManageE2ESessionsJob").ensureE2ESessions(E, !1, o("WAWebABProps").getABPropConfigValue("web_anr_throttle_message_send_prekeys_processing")), null == (C = s.sendPerfReporter) || C.setFetchedPrekeyCount(null == r ? void 0 : r.missedPrekeyCount), o("WAWebPostPrekeysDepletionMetric").maybePostPrekeysDepletionMetric({
                                                count: null == r ? void 0 : r.depletedPrekeyCount,
                                                prekeysFetchReason: o("WAWebWamEnumPrekeysFetchContext").PREKEYS_FETCH_CONTEXT.SEND_MESSAGE,
                                                messageType: o("WAWebWamEnumMessageType").MESSAGE_TYPE.STATUS,
                                                deviceSizeBucket: n("WAWebWamNumberToSizeBucket")(W.length)
                                            })
                                        } catch (e) {
                                            o("WALogger").ERROR(p || (p = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: ensureE2ESessions: failed for ", " devices: ", ""])), E.length, e).tags("messaging").devConsole(e)
                                        }
                                        null == (C = s.sendPerfReporter) || C.postPrekeysFetchStage(), null == (r = s.sendPerfReporter) || r.startClientEncryptStage(), C = (W = yield A(b, y, E, v, t))[0], r = W[1], y = W[2], o("WALogger").LOG(g || (g = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: encrypt message body done"]))), v = yield o("WAWebReportingTokenUtils").genReportingTokenBody(e.data, t), W = o("WAWap").wap("message", {
                                            id: o("WAWap").CUSTOM_STRING(m.id),
                                            to: o("WAWebCommsWapMd").CHAT_JID(b),
                                            type: o("WAWebE2EProtoUtils").typeAttributeFromProtobuf(t),
                                            edit: o("WAWebSendMsgCommonApi").editAttribute(t, e.data.subtype)
                                        }, C, r, y, a, v), yield o("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (t = s.sendPerfReporter) || t.postClientEncryptStage(), null == (e = s.sendPerfReporter) || e.startWrittenWireStage(), o("WALogger").LOG(h || (h = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusMsg: start sending ", ""])), m.id), yield o("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(W, o("WAWebCommsAckParser").toCoreAckTemplate({
                                            id: m.id,
                                            class: "message",
                                            from: b,
                                            participant: null
                                        })), null == (C = s.sendPerfReporter) || C.postWrittenWireStage(), yield n("WAWebUserPrefsStatus").markStatusHasSenderKey(E)
                                    })), y.apply(this, arguments)
                                }

                                function A(e, t, n, o, s) {
                                    return E.apply(this, arguments)
                                }

                                function E() {
                                    return E = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s, a) {
                                        var r, i = o("WAWebSendMsgCommonApi").encodeAndPad(a);
                                        a = o("WAWebBackendJobsCommon").mediaTypeFromProtobuf(a), i = (t = yield o("WAWebSignal").Cipher.encryptSenderKeyMsgSignalProto(e, t, i)).ciphertext, t = t.senderKeyBytes, n.length > 0 && (r = yield o("WAWebGetGroupKeyDistributionMsg").getKeyDistributionMsg(null, e, n, t, !1)), e = [], n = [], t = !1;
                                        var c = null;
                                        return r && r.length > 0 && (e = r.map((function(e) {
                                            var n = e.type,
                                                s = e.ciphertext;
                                            return e = e.participant, n === o("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (t = !0), o("WAWap").wap("to", {
                                                jid: o("WAWebCommsWapMd").DEVICE_JID(e)
                                            }, o("WAWap").wap("enc", {
                                                v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                                type: o("WAWap").CUSTOM_STRING(n)
                                            }, s))
                                        }))), n = s.map((function(e) {
                                            return o("WAWap").wap("to", {
                                                jid: o("WAWebCommsWapMd").USER_JID(e)
                                            })
                                        })), (n.length > 0 || e.length > 0) && (c = o("WAWap").wap("participants", null, e.concat(n))), s = o("WAWap").wap("enc", {
                                            v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                            type: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobs.flow").CiphertextType.Skmsg),
                                            mediatype: o("WAWebBackendJobsCommon").encodeMaybeMediaType(a)
                                        }, i), e = null, t && (n = yield o("WAWebAdvSignatureApi").getADVEncodedIdentity(), e = o("WAWap").wap("device-identity", null, n)), [c, s, e]
                                    })), E.apply(this, arguments)
                                }

                                function S(e) {
                                    switch (e) {
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.AllowList:
                                            return "allowlist";
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.DenyList:
                                            return "denylist";
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.Contact:
                                            return "contacts"
                                    }
                                }

                                function w(e, t, n, o) {
                                    return v.apply(this, arguments)
                                }

                                function v() {
                                    return v = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s) {
                                        var a = e.data.id,
                                            r = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID);
                                        o("WALogger").LOG(m || (m = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: send ", " to ", " device"])), a.id, n.length), t = (e = yield o("WAWebSendMsgCreateFanoutStanza").createFanoutMsgStanza(e, t, n, {
                                            fanoutType: o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT
                                        }, s)).stanza, yield o("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (n = s.sendPerfReporter) || n.startWrittenWireStage(), o("WALogger").LOG(W || (W = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: start sending ", ""])), a.id), yield o("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(t, o("WAWebCommsAckParser").toCoreAckTemplate({
                                            id: a.id,
                                            class: "message",
                                            from: r,
                                            participant: null
                                        })), null == (e = s.sendPerfReporter) || e.postWrittenWireStage()
                                    })), v.apply(this, arguments)
                                }
                                r.calculateRevokeSenderList = f, r.encryptAndSendStatusMsg = function(e, t, n) {
                                    return y.apply(this, arguments)
                                }
                            }), 98), window.require("__debug").modulesMap.WAWebRevokeStatusAction = null, __d("WAWebRevokeStatusAction", ["invariant", "WAJids", "WALogger", "WATimeUtils", "WAWebAck", "WAWebDBMessageDelete", "WAWebDBProcessMessage", "WAWebEncryptAndSendStatusMsg_", "WAWebLidMigrationUtils", "WAWebLidStatusMigrationUtils", "WAWebMessageSendPerfReporter", "WAWebMsgKey", "WAWebMsgModel", "WAWebMsgType", "WAWebOutgoingMessage", "WAWebPostSendStatusFailure", "WAWebSendMsgMetricReporter", "WAWebSendMsgTypes", "WAWebUserPrefsMeUser", "WAWebViewMode.flow", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r, i) {
                                var c, l, d, u, p, g;

                                function h() {
                                    return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t) {
                                        var n;
                                        o("WALogger").LOG(c || (c = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: send revoke status messege ", ""])), t.id);
                                        var s = yield m(t);
                                        null != s || i(0, 74709);
                                        var a = new(o("WAWebMsgModel").Msg)(s);
                                        a.wamMessageSendPerfReporter = new(o("WAWebMessageSendPerfReporter").MessageSendPerfReporter)({
                                            chatWid: t.to,
                                            mediaType: t.getWamMediaType(),
                                            messageType: t.getWamMessageType()
                                        });
                                        var r = o("WAWebSendMsgMetricReporter").createMsgModelMetricReporter(a);
                                        r.sendReporter = null != (n = r.sendReporter) ? n : r.createSendReporter(), null == (n = r.sendPerfReporter) || n.startSavedStage(), yield o("WAWebDBProcessMessage").storeMessages([s], a.to), null == (n = r.sendPerfReporter) || n.postSavedStage(), null == (n = r.sendPerfReporter) || n.startRenderedStage(), e.revokeMsgs([t.id.toString()]), o("WALogger").LOG(l || (l = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: start to send revoke status messege ", ""])), t.id).devConsole(s), null == (n = r.sendPerfReporter) || n.postRenderedStage(), e = {
                                            type: o("WAWebSendMsgTypes").SendMessageRecordType.Message,
                                            data: a
                                        }, s = o("WAWebOutgoingMessage").createOutgoingMessageProtobuf(o("WAWebOutgoingMessage").OutgoingMessageOriginType.Status, e), o("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: generate protobuf ", ""])), t.id).devConsole(s);
                                        try {
                                            yield o("WAWebEncryptAndSendStatusMsg_").encryptAndSendStatusMsg(e, s, r), o("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: done"]))), null == (n = r.sendReporter) || n.postSuccess(), a = o("WAWebLidMigrationUtils").getAlternateMsgKey(t.id), yield o("WAWebDBMessageDelete").removeStatusMessage([t.id.toString(), null == a ? void 0 : a.toString()].filter(Boolean)), o("WALogger").LOG(p || (p = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: remove status from storage"])))
                                        } catch (e) {
                                            o("WALogger").LOG(g || (g = babelHelpers.taggedTemplateLiteralLoose(["sendStatusRevokeMsgAction: failed"]))), o("WAWebPostSendStatusFailure").postStatusSendFailure(e, r)
                                        }
                                    })), h.apply(this, arguments)
                                }

                                function m(e) {
                                    return W.apply(this, arguments)
                                }

                                function W() {
                                    return W = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        var t = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID),
                                            s = o("WAWebLidStatusMigrationUtils").matWidConvert(o("WAWebUserPrefsMeUser").getMePnUserOrThrow()),
                                            a = o("WAWebLidStatusMigrationUtils").matWidConvert(s);
                                        a = new(n("WAWebMsgKey"))({
                                            from: s,
                                            to: t,
                                            id: yield n("WAWebMsgKey").newId(),
                                            participant: a,
                                            selfDir: "out"
                                        });
                                        var r = o("WATimeUtils").unixTime();
                                        return {
                                            id: a,
                                            author: s,
                                            type: o("WAWebMsgType").MSG_TYPE.PROTOCOL,
                                            kind: o("WAWebMsgType").MsgKind.ProtocolRevoke,
                                            viewMode: o("WAWebViewMode.flow").ViewModeType.VISIBLE,
                                            subtype: "sender_revoke",
                                            t: r,
                                            from: s,
                                            to: t,
                                            local: !0,
                                            revokeDuration: r - e.t,
                                            revokeTimestamp: r,
                                            protocolMessageKey: e.id,
                                            ack: o("WAWebAck").ACK.CLOCK
                                        }
                                    })), W.apply(this, arguments)
                                }
                                r.sendStatusRevokeMsgAction = function(e, t) {
                                    return h.apply(this, arguments)
                                }, r.createRevokeStatusMsgData = m
                            }), 98), __d("WAWebWhatsUpPlusStatusMedia", ["invariant", "Promise", "WALogger", "WAMediaCalculateFilehash", "WAPromiseCallSync", "WATimeUtils", "WAWebABProps", "WAWebAck", "WAWebAttachMenuGatingUtils", "WAWebCanvasUtils", "WAWebChatEphemerality", "WAWebCryptoCalculateFilehash", "WAWebCryptoRandomMediaKey", "WAWebImageUtils", "WAWebMediaCryptoEligibilityUtils", "WAWebMediaData", "WAWebMediaDataUtils", "WAWebMediaEntry", "WAWebMediaGatingShouldClearUploadedBlobs", "WAWebMediaGetUploadOriginForChat", "WAWebMediaInMemoryBlobCache", "WAWebMediaInMemoryKeyCache", "WAWebMediaMmsV4Download", "WAWebMediaMmsV4Upload", "WAWebMediaOpaqueData", "WAWebMediaStorage", "WAWebMediaTypes", "WAWebMediaUpdateMsg", "WAWebMediaUploadMmsThumbnail", "WAWebMessagePluginGenerateReportingTokenContent", "WAWebMessagingGatingUtils", "WAWebMiscGatingUtils", "WAWebMmsMediaTypes", "WAWebMsgDataUtils", "WAWebMsgType", "WAWebNewsletterGatingUtils", "WAWebNewsletterSendMsgAction", "WAWebRecentStickerCollectionMd", "WAWebSendMsgChatAction", "WAWebSendMsgResultAction", "WAWebSendStatusMsgAction", "WAWebStateUtils", "WAWebStatusGatingUtils", "WAWebURLUtils", "WAWebWamEnumDownloadOriginType", "WAWebWamEnumMessageSendResultType", "WAWebWamEnumWebcRmrReasonCode", "asyncToGeneratorRuntime", "err"], (function(e, t, n, o, s, a, r, i) {
                                var c;

                                function l() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["upload failed: thumbnail data incomplete\nDebug info:", ""], ["upload failed: thumbnail data incomplete\\nDebug info:", ""]);
                                    return l = function() {
                                        return e
                                    }, e
                                }

                                function d() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
                                    return d = function() {
                                        return e
                                    }, e
                                }

                                function u() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Sticker:sendToChat failed with unknown error"]);
                                    return u = function() {
                                        return e
                                    }, e
                                }

                                function p() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Media:sendToChat error\nresult: ", "\nuploadStage: ", "\nuploadResultKind: ", "\nerror: ", ""], ["Media:sendToChat error\\nresult: ", "\\nuploadStage: ", "\\nuploadResultKind: ", "\\nerror: ", ""]);
                                    return p = function() {
                                        return e
                                    }, e
                                }

                                function g() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Media:sendToChat canceled"]);
                                    return g = function() {
                                        return e
                                    }, e
                                }

                                function h() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Sticker:sendToChat failed with expressions panel enabled"]);
                                    return h = function() {
                                        return e
                                    }, e
                                }

                                function m() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
                                    return m = function() {
                                        return e
                                    }, e
                                }

                                function W() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
                                    return W = function() {
                                        return e
                                    }, e
                                }

                                function f(e, t) {
                                    return "product" === t.type ? o("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.PRODUCT_CATALOG : (t = o("WAWebStateUtils").unproxy(e)).isGroup ? t.isCAG ? o("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.COMMUNITY : o("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHAT_GROUP : t.isNewsletter ? o("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHANNEL : o("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHAT_PERSONAL
                                }

                                function b(e) {
                                    return e === o("WAWebMmsMediaTypes").MEDIA_TYPES.DOCUMENT && o("WAWebABProps").getABPropConfigValue("upload_document_thumb_mms_enabled")
                                }

                                function y(e) {
                                    return null == (e = e.wamMessageSendReporter) || e.postFailure({
                                        result: o("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_UPLOAD,
                                        isTerminal: !0
                                    }), o("WAWebSendMsgResultAction").SendMsgResult.ERROR_UPLOAD
                                }

                                function A(e, t, s, a) {
                                    return e.waitForPrep().then((function(e) {
                                        var t = e.mediaBlob;
                                        return !t || t instanceof n("WAWebMediaOpaqueData") ? e : n("WAWebMediaOpaqueData").createFromData(t, t.type).then((function(t) {
                                            return e.mediaBlob = t, e
                                        }))
                                    })).then((function(e) {
                                        var r = e.filehash;
                                        r || console.log(m()).sendLogs("media-fault: sendToChat filehash undefined");
                                        var i = o("WAWebMediaStorage").getOrCreateMediaObject(r),
                                            c = i.mediaBlob;
                                        return c && (c.retain(), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && e.mediaBlob.autorelease(), e.mediaBlob = c), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && (e.renderableUrl = e.mediaBlob.url()), i.consolidate(e.toJSON()), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && e.mediaBlob.autorelease(), (c = o("WAWebMediaDataUtils").shouldUseMediaCache(o("WAWebMmsMediaTypes").castToV4(i.type))) && e.mediaBlob instanceof n("WAWebMediaOpaqueData") && (c = e.mediaBlob.formData(), o("WAWebMediaInMemoryBlobCache").InMemoryMediaBlobCache.put(r, c)), o("WAWebMediaMmsV4Download").downloadMedia({
                                            mimetype: e.mimetype,
                                            mediaObject: i,
                                            downloadEvenIfExpensive: !0,
                                            mediaType: o("WAWebMmsMediaTypes").msgToMediaType({
                                                type: e.type,
                                                isGif: e.isGif,
                                                isNewsletter: t.isNewsletter
                                            }),
                                            rmrReason: o("WAWebWamEnumWebcRmrReasonCode").WEBC_RMR_REASON_CODE.SEND_TO_CHAT,
                                            downloadOrigin: f(t, a),
                                            mode: "manual",
                                            chatWid: t.id
                                        }), (r = babelHelpers.extends({}, i.msgProps(e))).caption = s.caption, (null == s.caption || "" === s.caption) && e.type === o("WAWebMediaTypes").OUTWARD_TYPES.DOCUMENT && (r.caption = e.filename), !0 === s.isViewOnce && (r.isViewOnce = !0), r
                                    }))
                                }

                                function E(e, t, n, o) {
                                    return new Promise((function(s, a) {
                                        S(e, t, n, o).then((function(e) {
                                            s(e)
                                        })).catch((function(e) {
                                            a(e)
                                        }))
                                    }))
                                }

                                function S(e, s, a, r) {
                                    return new Promise((async (m, W) => {
                                        var f, E, S = a.caption,
                                            w = a.footer,
                                            v = a.quotedMsg ? a.quotedMsg.msgContextInfo(s.id) : {};
                                        f = null != (f = a.productMsgOptions) ? f : {};
                                        var C, _ = o("WAWebChatEphemerality").isEphemeralSettingOn(s) ? o("WAWebChatEphemerality").getEphemeralSetting(s) : void 0,
                                            T = o("WAWebChatEphemerality").getEphemeralSettingTimestamp(s),
                                            M = o("WAWebChatEphemerality").getDisappearingModeInitiator(s),
                                            P = !1;
                                        s.isCAGAdmin() && (P = !0), E = null != (E = a.type) ? E : e._baseType, o("WAWebMessagingGatingUtils").isReportingTokenSendingEnabled() && o("WAWebMessagePluginGenerateReportingTokenContent").isMsgTypeReportingTokenCompatible(E) && (P = !0), P && (C = self.crypto.getRandomValues(new Uint8Array(32)));
                                        var x, L, U = babelHelpers.extends({}, await o("WAWebMsgDataUtils").genOutgoingMsgData(s, E), {
                                            type: E,
                                            caption: S,
                                            footer: w,
                                            quotedMsg: v.quotedMsg,
                                            quotedParticipant: v.quotedParticipant,
                                            quotedStanzaID: v.quotedStanzaID,
                                            quotedRemoteJid: v.quotedRemoteJid,
                                            mentionedJidList: a.mentionedJidList,
                                            groupMentions: a.groupMentions,
                                            isForwarded: a.isForwarded,
                                            forwardingScore: a.forwardingScore,
                                            forwardedNewsletterMessageInfo: a.forwardedNewsletterMessageInfo,
                                            multicast: a.multicast,
                                            forwardedFromWeb: a.forwardedFromWeb,
                                            ctwaContext: a.ctwaContext,
                                            ephemeralDuration: _,
                                            ephemeralSettingTimestamp: T,
                                            disappearingModeInitiator: M,
                                            messageSecret: C,
                                            isAvatar: a.isAvatar
                                        }, f);

                                        function k(e) {
                                            return D.apply(this, arguments)
                                        }

                                        function D() {
                                            return D = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                x = e;
                                                var a = e.mediaObject;
                                                a || console.log(d()).sendLogs("media-fault: incorrect media object for created msg"), a || i(0, 56330);
                                                var u = o("WAWebMmsMediaTypes").getMsgMediaType(e),
                                                    p = a.entries.getUploadEntry(o("WAWebMediaCryptoEligibilityUtils").isMediaCryptoExpectedForChat(s));
                                                p = p instanceof o("WAWebMediaEntry").EncryptedMediaEntry ? {
                                                    key: p.mediaKey,
                                                    timestamp: p.mediaKeyTimestamp
                                                } : n("WAWebCryptoRandomMediaKey")();
                                                var g = a.contentInfo,
                                                    h = g.fullPreviewData;
                                                g = g.fullPreviewSize;
                                                var m = e.body;
                                                if (b(u) && !h && a.contentInfo.preview) {
                                                    var W = yield o("WAWebImageUtils").base64ImageToCanvas(a.contentInfo.preview.url());
                                                    W = yield o("WAWebCanvasUtils").generateMicroThumb(W, 1300, {
                                                        mimetype: "image/jpeg",
                                                        maxAttempts: 10
                                                    }), h = a.contentInfo.preview, g = {
                                                        width: W.width,
                                                        height: W.height
                                                    }, m = n("WAWebURLUtils").parseDataURL(W.dataUrl).data
                                                }
                                                W = e.safe();
                                                var f = h && g && b(u);
                                                if (W = h && !0 === f && W.type === o("WAWebMsgType").MSG_TYPE.DOCUMENT ? n("WAWebMediaUploadMmsThumbnail")({
                                                        thumbnail: h,
                                                        mediaKeyInfo: p,
                                                        mediaType: o("WAWebMmsMediaTypes").MEDIA_TYPES.THUMBNAIL_DOCUMENT,
                                                        uploadOrigin: n("WAWebMediaGetUploadOriginForChat")(s),
                                                        forwardedFromWeb: Boolean(e.forwardedFromWeb),
                                                        isViewOnce: Boolean(e.isViewOnce)
                                                    }) : (c || (c = t("Promise"))).resolve(null), h = {
                                                        mimetype: e.mimetype,
                                                        mediaObject: a,
                                                        mediaType: u,
                                                        forwardedFromWeb: Boolean(e.forwardedFromWeb),
                                                        uploadOrigin: n("WAWebMediaGetUploadOriginForChat")(s),
                                                        isViewOnce: Boolean(e.isViewOnce),
                                                        earlyUpload: r
                                                    }, e = o("WAWebMediaCryptoEligibilityUtils").isMediaCryptoExpectedForChat(s) ? o("WAWebMediaMmsV4Upload").uploadMedia(babelHelpers.extends({}, h, {
                                                        mediaKeyInfo: p
                                                    })) : o("WAWebMediaMmsV4Upload").uploadUnencryptedMedia(babelHelpers.extends({}, h, {
                                                        calculateToken: o("WAMediaCalculateFilehash").getRandomFilehash
                                                    })), h = a.filehash, o("WAWebMediaInMemoryKeyCache").shouldUseMediaKeyCache() && null != h && o("WAWebMediaInMemoryKeyCache").MediaKeyCache.put(h, p), W = (e = (p = yield(c || (c = t("Promise"))).all([e, W]))[0]).kind, e = e.mediaEntry, p = p[1], n("WAWebMediaGatingShouldClearUploadedBlobs")(u) && a.clearBlob({
                                                        reset: !0
                                                    }), L = W, !e) throw n("err")("upload failed: media entry was not created");
                                                if (o("WAWebMediaInMemoryKeyCache").shouldUseMediaKeyCache() && null != h && o("WAWebMediaInMemoryKeyCache").MediaKeyCache.delete(h), u = null == p ? void 0 : p.mediaEntry, W = {}, !0 === f) {
                                                    if (!(u && p && g)) throw h = {
                                                        thumbnailResultEntry: u,
                                                        uploadThumbnailResult: p,
                                                        fullPreviewSize: g
                                                    }, console.log(l(), JSON.stringify(h)).devConsole(h).sendLogs("mms-thumbnail-data-incomplete"), n("err")("upload failed: thumbnail data incomplete");
                                                    W = {
                                                        thumbnailDirectPath: u.directPath,
                                                        thumbnailSha256: p.filehash,
                                                        thumbnailEncSha256: u.encFilehash,
                                                        thumbnailHeight: g.height,
                                                        thumbnailWidth: g.width
                                                    }
                                                }
                                                return yield n("WAWebMediaUpdateMsg")(x, babelHelpers.extends({
                                                    deprecatedMms3Url: e.deprecatedMms3Url,
                                                    directPath: e.directPath,
                                                    mediaKey: e.getMediaKey(),
                                                    mediaKeyTimestamp: e.getMediaKeyTimestamp(),
                                                    filehash: a.filehash,
                                                    encFilehash: e.getEncfilehash(),
                                                    size: a.size,
                                                    streamingSidecar: e.sidecar,
                                                    firstFrameSidecar: e.firstFrameSidecar,
                                                    body: m,
                                                    stickerSentTs: o("WATimeUtils").unixTimeMs(),
                                                    mediaHandle: e instanceof o("WAWebMediaEntry").UnencryptedMediaEntry ? e.handle : null
                                                }, W)), x
                                            })), D.apply(this, arguments)
                                        }
                                        a.type === o("WAWebMsgType").MSG_TYPE.DOCUMENT && Boolean(a.caption) && (U.isCaptionByUser = !0), !0 === a.addEvenWhilePreparing ? (P = a.placeholderProps || {}, E = babelHelpers.extends({}, P, U), S = function(t) {
                                            return x = t, A(e, s, a, U).then((function(e) {
                                                return n("WAWebMediaUpdateMsg")(x, e)
                                            })).then((function() {
                                                return k(x)
                                            }))
                                        }, o("WAWebNewsletterGatingUtils").isNewsletterEnabled() && s.isNewsletter ? w = o("WAWebNewsletterSendMsgAction").sendNewsletterMediaMsg(s, E, S) : o("WAWebStatusGatingUtils").isStatusPostingEnabled() && s.id.isStatusV3() ? (o("WAWebSendStatusMsgAction").sendStatusMediaMsgAction(E, S), w = (c || (c = t("Promise"))).reject(n("err")("unsupported"))) : w = o("WAWebSendMsgChatAction").addAndSendMsgToChat(s, E, S)[1]) : (v = A(e, s, a, U).then((function(e) {
                                            var t = !0 === a.useBasePropsType ? U.type : e.type;
                                            return babelHelpers.extends({}, U, e, {
                                                type: t
                                            })
                                        })), w = t("WAWebSendStatusMsgAction").sendStatusMediaMsgAction(await v, k)), w.then((function(e) {
                                            m(e);
                                            var t, n = e.result;
                                            if (e = e.error, (null == n ? void 0 : n.messageSendResult) === o("WAWebSendMsgResultAction").SendMsgResult.OK) return x.type === o("WAWebMediaTypes").OUTWARD_TYPES.STICKER && !0 !== x.isAvatar && o("WAWebRecentStickerCollectionMd").RecentStickerCollectionMd.addStickerWithMediaData(x), {
                                                messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.OK
                                            };
                                            if (x && (x.ack = o("WAWebAck").ACK.FAILED), t = null == (t = x) || null == (t = t.mediaObject) ? void 0 : t.uploadStage, x && o("WAWebMmsMediaTypes").getMsgMediaType(x) === o("WAWebMediaTypes").OUTWARD_TYPES.STICKER && o("WAWebAttachMenuGatingUtils").areExpressionPanelsEnabled()) {
                                                var s = t || "undefined";
                                                console.log(h()).tags("non-sad").sendLogs("sticker-send-fail-with-expressions-panel-enabled-uploadStage-" + s, .001)
                                            }
                                            if (L === o("WAWebMediaMmsV4Upload").UploadMediaResultKind.CANCELLATION) return o("WALogger").LOG(g()).devConsole({
                                                result: n,
                                                uploadStage: t,
                                                error: e
                                            }), null == (s = x.wamMessageSendReporter) || s.postFailure({
                                                result: o("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_CANCELLED,
                                                isTerminal: !0
                                            }), {
                                                messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.ERROR_CANCELLED
                                            };
                                            if (o("WALogger").WARN(p(), n, t, L, String(e)).devConsole(e), null != t) switch (t) {
                                                case o("WAWebMediaTypes").UploadStage.NEED_UPLOAD:
                                                case o("WAWebMediaTypes").UploadStage.ERROR_TOO_LARGE:
                                                    return {
                                                        messageSendResult: y(x)
                                                    };
                                                case o("WAWebMediaTypes").UploadStage.ERROR_MISSING:
                                                    return {
                                                        messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.ERROR_EXPIRED
                                                    }
                                            }
                                            return L === o("WAWebMediaMmsV4Upload").UploadMediaResultKind.ERROR ? {
                                                messageSendResult: y(x)
                                            } : null != n ? n : (x && o("WAWebMmsMediaTypes").getMsgMediaType(x) === o("WAWebMediaTypes").OUTWARD_TYPES.STICKER && console.log(u()).sendLogs("sticker-send-fail-unknown-" + (o("WAWebAttachMenuGatingUtils").areExpressionPanelsEnabled() ? "expression-panels" : "old-panels")), {
                                                messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.ERROR_UNKNOWN
                                            })
                                        }))
                                    }))
                                }
                                e = function() {
                                    function e(e, t) {
                                        var s = this;
                                        this._baseType = e, this._mediaData = new(n("WAWebMediaData"))({
                                            mediaStage: o("WAWebMediaTypes").MediaDataStage.PREPARING
                                        }), this._prepwork = t.then((function(e) {
                                            if (s._mediaData.set(e), !e.filehash) return e.mediaBlob || console.log(W()).sendLogs("media-fault: no hash or blob"), o("WAWebCryptoCalculateFilehash").calculateFilehashFromBlob(e.mediaBlob).then((function(e) {
                                                s._mediaData.filehash = e
                                            }))
                                        }), (function(e) {
                                            throw s._mediaData.mediaStage = o("WAWebMediaTypes").MediaDataStage.ERROR_UNSUPPORTED, e
                                        }))
                                    }
                                    var s = e.prototype;
                                    return s.sendToChat = function(e, t, n) {
                                        return o("WAPromiseCallSync").promiseCallSync(E, null, this, e, t, n)
                                    }, s.waitForPrep = function() {
                                        var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                            return yield this._prepwork, this._mediaData
                                        }));
                                        return function() {
                                            return e.apply(this, arguments)
                                        }
                                    }(), e
                                }(), r.MediaPrep = e, r.sendMediaMsgToChat = E
                            }), 98), window.require("__debug").modulesMap.WAWebEncryptAndSendStatusMsg = null, __d("WAWebEncryptAndSendStatusMsg", ["WADeprecatedSendIq", "WAJids", "WALogger", "WANullthrows", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiContact", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebDBDeviceListFanout", "WAWebE2EProtoUtils", "WAWebGetGroupKeyDistributionMsg", "WAWebManageE2ESessionsJob", "WAWebProtobufsE2E.pb", "WAWebReportingTokenUtils", "WAWebSchemaMessageInfo", "WAWebSendMsgCommonApi", "WAWebSendMsgCreateFanoutStanza", "WAWebSignal", "WAWebSignalProtocolStore", "WAWebUserPrefsMeUser", "WAWebUserPrefsStatus", "WAWebUserPrefsStatusType", "WAWebWamEnumMessageDistributionEnumType", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r) {
                                function i() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: start sending ", ""]);
                                    return i = function() {
                                        return e
                                    }, e
                                }

                                function c() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: send ", " to ", " device"]);
                                    return c = function() {
                                        return e
                                    }, e
                                }

                                function l() {
                                    return l = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, s) {
                                        let a = {
                                            iniciando: {
                                                zh: "正在启动状态发送过程...",
                                                en: "Starting status sending process...",
                                                fr: "Démarrage du processus d'envoi du statut...",
                                                es: "Iniciando proceso de envío de estado...",
                                                pt: "Iniciando processo de envio de status..."
                                            },
                                            nenhum_contato: {
                                                zh: "未找到可发送的联系人。",
                                                en: "No contacts found for sending.",
                                                fr: "Aucun contact trouvé pour l'envoi.",
                                                es: "No se encontraron contactos para enviar.",
                                                pt: "Nenhum contato encontrado para envio."
                                            },
                                            total_contatos: {
                                                zh: "发送的联系人总数：{0}",
                                                en: "Total contacts for sending: {0}",
                                                fr: "Total des contacts pour l'envoi: {0}",
                                                es: "Total de contactos para envío: {0}",
                                                pt: "Total de contatos para envio: {0}"
                                            },
                                            erro_envio_titulo: {
                                                zh: "连接错误",
                                                en: "Connection Error",
                                                fr: "Erreur de connexion",
                                                es: "Error de conexión",
                                                pt: "Erro de Conexão"
                                            },
                                            erro_envio_mensagem: {
                                                zh: "连接错误，请检查您的网络设置。",
                                                en: "You need to disconnect your WhatsApp Web and connect again.",
                                                fr: "Vous devez déconnecter votre WhatsApp Web et vous reconnecter.",
                                                es: "Necesitas desconectar tu WhatsApp Web y conectarte nuevamente.",
                                                pt: "Você precisa desconectar o seu WhatsApp Web e conectar novamente."
                                            },
                                            desconectar_agora: {
                                                zh: "现在断开连接",
                                                en: "Disconnect Now",
                                                fr: "Déconnecter maintenant",
                                                es: "Desconectar ahora",
                                                pt: "Desconectar Agora"
                                            },
                                            cancelar: {
                                                zh: "取消",
                                                en: "Cancel",
                                                fr: "Annuler",
                                                es: "Cancelar",
                                                pt: "Cancelar"
                                            },
                                            adicionando_meta: {
                                                zh: "正在添加提及的用户...",
                                                en: "Adding META mentioned_users...",
                                                fr: "Ajout des utilisateurs META mentionnés...",
                                                es: "Añadiendo usuarios META mencionados...",
                                                pt: "Adicionando META mentioned_users..."
                                            },
                                            coletando_dispositivos: {
                                                zh: "正在收集设备列表...",
                                                en: "Collecting device list...",
                                                fr: "Collecte de la liste des appareils...",
                                                es: "Recopilando lista de dispositivos...",
                                                pt: "Coletando lista de dispositivos..."
                                            },
                                            total_dispositivos: {
                                                zh: "共找到 {0} 个设备",
                                                en: "Total of {0} devices found",
                                                fr: "Total de {0} appareils trouvés",
                                                es: "Total de {0} dispositivos encontrados",
                                                pt: "Total de {0} dispositivos encontrados"
                                            },
                                            obtendo_distribuicao: {
                                                 zh: "正在获取密钥分发列表...",
                                                en: "Getting key distribution list...",
                                                fr: "Obtention de la liste de distribution des clés...",
                                                es: "Obteniendo lista de distribución de claves...",
                                                pt: "Obtendo lista de distribuição de chaves..."
                                            },
                                            distribuindo_chaves: {
                                                zh: "将密钥分发给 {0} 个设备",
                                                en: "Distributing keys to {0} devices",
                                                fr: "Distribution des clés à {0} appareils",
                                                es: "Distribuyendo claves a {0} dispositivos",
                                                pt: "Distribuindo chaves para {0} dispositivos"
                                            },
                                            criando_registros: {
                                                zh: "创建接收记录...",
                                                en: "Creating receipt records...",
                                                fr: "Création des enregistrements de réception...",
                                                es: "Creando registros de recibo...",
                                                pt: "Criando registros de recebimento..."
                                            },
                                            registros_processados: {
                                                zh: "已处理记录：{0}/{1} ({2}%)",
                                                en: "Records processed: {0}/{1} ({2}%)",
                                                fr: "Enregistrements traités: {0}/{1} ({2}%)",
                                                es: "Registros procesados: {0}/{1} ({2}%)",
                                                pt: "Registros processados: {0}/{1} ({2}%)"
                                            },
                                            preparando_sessoes: {
                                                zh: "正在准备 E2E 会议...",
                                                en: "Preparing E2E sessions...",
                                                fr: "Préparation des sessions E2E...",
                                                es: "Preparando sesiones E2E...",
                                                pt: "Preparando sessões E2E..."
                                            },
                                            encriptando: {
                                                zh: "正在加密消息...",
                                                en: "Encrypting message...",
                                                fr: "Chiffrement du message...",
                                                es: "Encriptando mensaje...",
                                                pt: "Encriptando mensagem..."
                                            },
                                            preparando_dados: {
                                                zh: "准备消息数据",
                                                en: "Preparing message data",
                                                fr: "Préparation des données du message",
                                                es: "Preparando datos del mensaje",
                                                pt: "Preparando dados da mensagem"
                                            },
                                            preparando_envio: {
                                                zh: "正在准备发送消息...",
                                                en: "Preparing message for sending...",
                                                fr: "Préparation du message pour l'envoi...",
                                                es: "Preparando mensaje para envío...",
                                                pt: "Preparando mensagem para envio..."
                                            },
                                            enviando_status: {
                                                zh: "正在向 {0} 个联系人发送状态...",
                                                en: "Sending status to {0} contacts...",
                                                fr: "Envoi du statut à {0} contacts...",
                                                es: "Enviando estado a {0} contactos...",
                                                pt: "Enviando status para {0} contatos..."
                                            },
                                            enviando_confirmacoes: {
                                                zh: "向标记的联系人发送确认...",
                                                en: "Sending confirmations to marked contacts...",
                                                fr: "Envoi des confirmations aux contacts marqués...",
                                                es: "Enviando confirmaciones a contactos marcados...",
                                                pt: "Enviando confirmações para contatos marcados..."
                                            },
                                            confirmacao_enviada: {
                                                zh: "确认信息已发送至 {0} ({1}/{2})",
                                                en: "Confirmation sent to {0} ({1}/{2})",
                                                fr: "Confirmation envoyée à {0} ({1}/{2})",
                                                es: "Confirmación enviada a {0} ({1}/{2})",
                                                pt: "Confirmação enviada para {0} ({1}/{2})"
                                            },
                                            erro_confirmacao: {
                                                zh: "向 {0} 发送确认信息时出错：{1}",
                                                en: "Error sending confirmation to {0}: {1}",
                                                fr: "Erreur lors de l'envoi de la confirmation à {0}: {1}",
                                                es: "Error al enviar confirmación a {0}: {1}",
                                                pt: "Erro ao enviar confirmação para {0}: {1}"
                                            },
                                            concluido: {
                                                zh: "完成！状态已成功发送至联系人。",
                                                en: "Completed! Status successfully sent to {0} contacts.",
                                                fr: "Terminé ! Statut envoyé avec succès à {0} contacts.",
                                                es: "¡Completado! Estado enviado con éxito a {0} contactos.",
                                                pt: "Concluído! Status enviado com sucesso para {0} contatos."
                                            },
                                            titulo_iniciado: {
                                                zh: "开始发送...",
                                                en: "Sending started...",
                                                fr: "Envoi commencé...",
                                                es: "Envío iniciado...",
                                                pt: "Enviado iniciado..."
                                            },
                                            titulo_sucesso: {
                                                zh: "状态发送成功！",
                                                en: "Status sent successfully!",
                                                fr: "Statut envoyé avec succès !",
                                                es: "¡Estado enviado con éxito!",
                                                pt: "Status enviado com sucesso!"
                                            },
                                            status_enviado: {
                                                zh: "状态已发送至 {0} 个联系人。",
                                                en: "Status sent to {0} contacts.",
                                                fr: "Statut envoyé à {0} contacts.",
                                                es: "Estado enviado a {0} contactos.",
                                                pt: "Status enviado para {0} contatos."
                                            },
                                            descricao_inicial: {
                                                zh: "我正在发送状态。联系人越多，发送过程所需的时间就越长。请勿关闭或刷新 WhatsApp 网页，等待状态发送成功的消息。",
                                                en: "I'm sending the status. The more contacts you have, the longer the sending process will take. Don't close or refresh the whatsapp web page, wait for the message of status sent successfully.",
                                                fr: "J'envoie le statut. Plus vous avez de contacts, plus le processus d'envoi sera long. Ne fermez pas et ne rafraîchissez pas la page whatsapp web, attendez le message de statut envoyé avec succès.",
                                                es: "Estoy enviando el estado. Cuantos más contactos tengas, más tardará el proceso de envío. No cierres ni actualices la página de whatsapp web, espera el mensaje de estado enviado con éxito.",
                                                pt: "Estou enviando o status. Quanto mais contatos você tiver, mais demorado será o processo de envio. Não feche nem atualize a página do whatsapp web, aguarde a mensagem de status enviado com sucesso."
                                            },
                                            titulo_cancelado: {
                                                zh: "发送取消",
                                                en: "Sending canceled",
                                                fr: "Envoi annulé",
                                                es: "Envío cancelado",
                                                pt: "Envio cancelado"
                                            }
                                        };
                                        const r = "zh";
                                        var i;

                         
                                        function c(e, ...t) {
                                            return a[e] ? function(e, ...t) {
                                                return e.replace(/{(\d+)}/g, (function(e, n) {
                                                    return void 0 !== t[n] ? t[n] : e
                                                }))
                                            }(a[e][r] || a[e].zh || e, ...t) : e
                                        }
                                        let l = null,
                                            u = null,
                                            h = null,
                                            m = !1;

                                        function W(e, t = null, ...n) {
                                            const o = c(e, ...n);
                                            if (console.log(o), !m) {
                                                const o = document.getElementById("progress-circle"),
                                                    s = document.getElementById("send-progress-text"),
                                                    a = document.getElementById("send-status-text");
                                                if (!(o && s && a)) return void
                                                function() {
                                                    try {
                                                        if (document.querySelector(".status-send-modal")) return l = document.getElementById("send-progress-bar"), u = document.getElementById("send-progress-text"), h = document.getElementById("send-status-text"), m = l && u && h, Promise.resolve(m);
                                                        if ("undefined" != typeof Swal) {
                                                            Swal.close();
                                                            const e = document.getElementById("preparingModalBackdrop");
                                                            e && (e.style.animation = "statusModalFadeOut 0.3s ease", setTimeout((() => e.remove()), 300))
                                                        }
                                                        const e = '\n<div id="sendModalBackdrop" class="send-modal-backdrop">\n    <div class="status-send-modal">\n        \n        \x3c!-- Header Minimalista --\x3e\n        <div class="send-modal-header">\n            <div class="send-header-icon">\n                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">\n                    <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                </svg>\n            </div>\n            <div class="send-header-text">\n                <h3>Enviando Status</h3>\n                <p>Processamento em andamento</p>\n            </div>\n        </div>\n\n        \x3c!-- Progresso Principal --\x3e\n        <div class="send-modal-body">\n            \n            \x3c!-- Círculo de Progresso --\x3e\n            <div class="send-progress-circle">\n                <svg class="progress-ring" width="160" height="160">\n                    <circle class="progress-ring-bg" cx="80" cy="80" r="70" />\n                    <circle class="progress-ring-fill" id="progress-circle" cx="80" cy="80" r="70" />\n                </svg>\n                <div class="progress-center">\n                    <div id="send-progress-text" class="progress-number">0%</div>\n                    <div class="progress-label">Concluído</div>\n                </div>\n            </div>\n\n            \x3c!-- Status Atual --\x3e\n            <div class="send-status-current">\n                <div class="status-pulse"></div>\n                <p id="send-status-text">Iniciando processo...</p>\n            </div>\n\n            \x3c!-- Estatísticas com Relação Visual --\x3e\n            <div class="send-stats-relationship">\n                \n                \x3c!-- Contatos --\x3e\n                <div class="stat-relationship-item">\n                    <div class="stat-rel-icon contacts-icon">\n                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n                            <circle cx="9" cy="7" r="4"/>\n                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>\n                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>\n                        </svg>\n                    </div>\n                    <div class="stat-rel-content">\n                        <div id="contacts-stat" class="stat-rel-value">-</div>\n                        <div class="stat-rel-label">Contatos</div>\n                    </div>\n                </div>\n\n                \x3c!-- Conector Visual --\x3e\n                <div class="stat-relationship-connector">\n                    <svg width="40" height="24" viewBox="0 0 40 24" fill="none">\n                        <path d="M2 12h36M30 4l8 8-8 8" stroke="url(#connectorGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                    </svg>\n                    <div class="connector-badge">\n                        <span id="devices-per-contact">~1.7</span>\n                    </div>\n                </div>\n\n                \x3c!-- Dispositivos --\x3e\n                <div class="stat-relationship-item">\n                    <div class="stat-rel-icon devices-icon">\n                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>\n                            <line x1="12" y1="18" x2="12.01" y2="18"/>\n                        </svg>\n                    </div>\n                    <div class="stat-rel-content">\n                        <div id="devices-stat" class="stat-rel-value">-</div>\n                        <div class="stat-rel-label">Dispositivos</div>\n                    </div>\n                </div>\n\n            </div>\n\n            \x3c!-- Contador de Enviados --\x3e\n            <div class="send-counter-card">\n                <div class="counter-icon">\n                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <polyline points="20 6 9 17 4 12"/>\n                    </svg>\n                </div>\n                <div class="counter-content">\n                    <span class="counter-label">Status Enviados</span>\n                    <span id="sent-counter" class="counter-value">0</span>\n                </div>\n            </div>\n\n            \x3c!-- Milestones --\x3e\n            <div id="milestone-area" class="milestone-area"></div>\n\n            \x3c!-- Aviso Discreto --\x3e\n            <div id="keep-open-warning" class="keep-open-notice">\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">\n                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n                </svg>\n                <span>Mantenha esta janela aberta</span>\n            </div>\n\n        </div>\n\n    </div>\n</div>\n\n\x3c!-- SVG Gradients (Escondidos) --\x3e\n<svg width="0" height="0" style="position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden;">\n    <defs>\n        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">\n            <stop offset="0%" style="stop-color:#667eea"/>\n            <stop offset="100%" style="stop-color:#764ba2"/>\n        </linearGradient>\n        <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">\n            <stop offset="0%" style="stop-color:#667eea"/>\n            <stop offset="100%" style="stop-color:#764ba2"/>\n        </linearGradient>\n    </defs>\n</svg>\n\n<style>\n/* ==================== RESET & BASE ==================== */\n.send-modal-backdrop,\n.send-modal-backdrop * {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\n/* ==================== BACKDROP ==================== */\n.send-modal-backdrop {\n    position: fixed;\n    inset: 0;\n    background: rgba(15, 23, 42, 0.75);\n    backdrop-filter: blur(8px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 100000;\n    animation: backdropFade 0.2s ease;\n}\n\n@keyframes backdropFade {\n    from { opacity: 0; }\n    to { opacity: 1; }\n}\n\n/* ==================== MODAL CONTAINER ==================== */\n.status-send-modal {\n    background: #ffffff;\n    width: 520px;\n    max-width: 95vw;\n    border-radius: 16px;\n    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\n    animation: modalSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\n    overflow: hidden;\n}\n\n@keyframes modalSlide {\n    from {\n        opacity: 0;\n        transform: scale(0.9) translateY(20px);\n    }\n    to {\n        opacity: 1;\n        transform: scale(1) translateY(0);\n    }\n}\n\n/* ==================== HEADER MINIMALISTA ==================== */\n.send-modal-header {\n    padding: 24px 28px;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    display: flex;\n    align-items: center;\n    gap: 14px;\n}\n\n.send-header-icon {\n    width: 44px;\n    height: 44px;\n    background: rgba(255, 255, 255, 0.15);\n    border-radius: 12px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: white;\n    flex-shrink: 0;\n}\n\n.send-header-text h3 {\n    font-size: 18px;\n    font-weight: 600;\n    color: white;\n    margin: 0 0 4px 0;\n    letter-spacing: -0.2px;\n}\n\n.send-header-text p {\n    font-size: 13px;\n    color: rgba(255, 255, 255, 0.85);\n    margin: 0;\n    font-weight: 400;\n}\n\n/* ==================== BODY ==================== */\n.send-modal-body {\n    padding: 40px 32px 32px;\n    background: white;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 24px;\n}\n\n/* ==================== CÍRCULO DE PROGRESSO ==================== */\n.send-progress-circle {\n    position: relative;\n    width: 160px;\n    height: 160px;\n}\n\n.progress-ring {\n    transform: rotate(-90deg);\n}\n\n.progress-ring-bg {\n    fill: none;\n    stroke: #f1f5f9;\n    stroke-width: 8;\n}\n\n.progress-ring-fill {\n    fill: none;\n    stroke: url(#progressGradient);\n    stroke-width: 8;\n    stroke-linecap: round;\n    stroke-dasharray: 440;\n    stroke-dashoffset: 440;\n    transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.progress-center {\n    position: absolute;\n    inset: 0;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    gap: 4px;\n}\n\n.progress-number {\n    font-size: 36px;\n    font-weight: 700;\n    color: #1e293b;\n    letter-spacing: -1px;\n    line-height: 1;\n}\n\n.progress-label {\n    font-size: 11px;\n    color: #64748b;\n    font-weight: 500;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n}\n\n/* ==================== STATUS ATUAL ==================== */\n.send-status-current {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    padding: 14px 20px;\n    background: #f8fafc;\n    border-radius: 10px;\n    width: 100%;\n    max-width: 420px;\n}\n\n.status-pulse {\n    width: 8px;\n    height: 8px;\n    background: #667eea;\n    border-radius: 50%;\n    flex-shrink: 0;\n    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}\n\n@keyframes pulse {\n    0%, 100% {\n        opacity: 1;\n        transform: scale(1);\n    }\n    50% {\n        opacity: 0.5;\n        transform: scale(1.15);\n    }\n}\n\n.send-status-current p {\n    font-size: 14px;\n    color: #475569;\n    font-weight: 500;\n    margin: 0;\n    line-height: 1.4;\n}\n\n/* ==================== ESTATÍSTICAS COM RELAÇÃO VISUAL ==================== */\n.send-stats-relationship {\n    display: flex;\n    align-items: center;\n    gap: 0;\n    padding: 20px 24px;\n    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\n    border-radius: 14px;\n    width: 100%;\n    max-width: 420px;\n    border: 1px solid #e2e8f0;\n}\n\n.stat-relationship-item {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    flex: 1;\n}\n\n.stat-rel-icon {\n    width: 44px;\n    height: 44px;\n    border-radius: 12px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-shrink: 0;\n}\n\n.contacts-icon {\n    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);\n    color: #1e40af;\n}\n\n.devices-icon {\n    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);\n    color: #4338ca;\n}\n\n.stat-rel-content {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n}\n\n.stat-rel-value {\n    font-size: 24px;\n    font-weight: 700;\n    color: #1e293b;\n    letter-spacing: -0.5px;\n    line-height: 1;\n}\n\n.stat-rel-label {\n    font-size: 11px;\n    color: #64748b;\n    font-weight: 500;\n    text-transform: uppercase;\n    letter-spacing: 0.3px;\n}\n\n/* Conector Visual */\n.stat-relationship-connector {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n    padding: 0 16px;\n    position: relative;\n}\n\n.stat-relationship-connector svg {\n    opacity: 0.6;\n}\n\n.connector-badge {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    background: white;\n    border: 1.5px solid #667eea;\n    border-radius: 8px;\n    padding: 3px 8px;\n    font-size: 11px;\n    font-weight: 700;\n    color: #667eea;\n    white-space: nowrap;\n    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);\n}\n\n/* ==================== CONTADOR DE ENVIADOS ==================== */\n.send-counter-card {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding: 14px 18px;\n    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);\n    border: 1px solid #bbf7d0;\n    border-radius: 12px;\n    width: 100%;\n    max-width: 420px;\n}\n\n.counter-icon {\n    width: 36px;\n    height: 36px;\n    background: #10b981;\n    border-radius: 10px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: white;\n    flex-shrink: 0;\n}\n\n.counter-content {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    flex: 1;\n}\n\n.counter-label {\n    font-size: 13px;\n    color: #065f46;\n    font-weight: 600;\n}\n\n.counter-value {\n    font-size: 20px;\n    font-weight: 700;\n    color: #047857;\n    letter-spacing: -0.3px;\n    margin-left: auto;\n}\n\n/* ==================== MILESTONES ==================== */\n.milestone-area {\n    width: 100%;\n    max-width: 420px;\n}\n\n.milestone-badge {\n    display: inline-flex;\n    align-items: center;\n    gap: 8px;\n    padding: 10px 16px;\n    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);\n    border: 1px solid #a7f3d0;\n    border-radius: 10px;\n    font-size: 13px;\n    color: #065f46;\n    font-weight: 600;\n    animation: badgeSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n    margin-bottom: 8px;\n}\n\n@keyframes badgeSlide {\n    from {\n        opacity: 0;\n        transform: translateX(-10px);\n    }\n    to {\n        opacity: 1;\n        transform: translateX(0);\n    }\n}\n\n.milestone-badge svg {\n    width: 18px;\n    height: 18px;\n    color: #10b981;\n    flex-shrink: 0;\n}\n\n/* ==================== AVISO DISCRETO ==================== */\n.keep-open-notice {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding: 10px 16px;\n    background: #fffbeb;\n    border: 1px solid #fde68a;\n    border-radius: 8px;\n    font-size: 12px;\n    color: #92400e;\n    font-weight: 500;\n    width: 100%;\n    max-width: 420px;\n    transition: all 0.3s ease;\n}\n\n.keep-open-notice svg {\n    color: #f59e0b;\n    flex-shrink: 0;\n}\n\n/* ==================== ESTADO DE SUCESSO ==================== */\n.send-modal-header.success {\n    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;\n}\n\n.status-pulse.success {\n    background: #10b981 !important;\n}\n\n.keep-open-notice.hidden {\n    opacity: 0;\n    transform: translateY(5px);\n    pointer-events: none;\n}\n\n/* ==================== RESPONSIVO ==================== */\n@media (max-width: 600px) {\n    .status-send-modal {\n        width: 100%;\n        margin: 20px;\n    }\n    \n    .send-modal-body {\n        padding: 32px 24px 24px;\n    }\n    \n    .send-progress-circle {\n        width: 140px;\n        height: 140px;\n    }\n    \n    .progress-number {\n        font-size: 32px;\n    }\n    \n    .send-stats-relationship {\n        flex-direction: column;\n        gap: 16px;\n        padding: 16px;\n    }\n    \n    .stat-relationship-connector {\n        transform: rotate(90deg);\n        padding: 12px 0;\n    }\n    \n    .stat-relationship-item {\n        width: 100%;\n        justify-content: center;\n    }\n}\n</style>\n';
                                                        return document.body.insertAdjacentHTML("beforeend", e), l = document.getElementById("progress-circle"), u = document.getElementById("send-progress-text"), h = document.getElementById("send-status-text"), m = l && u && h, Promise.resolve(m)
                                                    } catch (e) {
                                                        return console.error("Erro ao inicializar UI:", e), Promise.resolve(!1)
                                                    }
                                                }().then((o => {
                                                    o && !m && (m = o, W(e, t, ...n))
                                                }));
                                                l = o, u = s, h = a, m = !0
                                            }
                                            if (!m) return;
                                            if (h && (h.textContent = o), null !== t && l && u) {
                                                const n = 2 * Math.PI * 70,
                                                    s = n - t / 100 * n;
                                                l.style.strokeDashoffset = s, u.textContent = `${Math.round(t)}%`;
                                                const a = document.getElementById("milestone-area");
                                                if (a && [25, 50, 75].includes(t) && "registros_processados" !== e) {
                                                    const e = document.createElement("div");
                                                    e.className = "milestone-badge", e.innerHTML = `\n                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">\n                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>\n                </svg>\n                <span>${t}% - ${o}</span>\n            `, a.innerHTML = "", a.appendChild(e), setTimeout((() => {
                                                        e.style.opacity = "0", e.style.transform = "translateX(10px)", setTimeout((() => e.remove()), 400)
                                                    }), 2500)
                                                }
                                            }
                                            const s = document.getElementById("contacts-stat"),
                                                a = document.getElementById("devices-stat"),
                                                r = document.getElementById("devices-per-contact"),
                                                i = document.getElementById("sent-counter");
                                            let d = 0,
                                                p = 0;
                                            if ("total_contatos" === e && s && (d = parseInt(n[0]) || 0, s.textContent = n[0] || "-", a && "-" !== a.textContent && (p = parseInt(a.textContent) || 0, d > 0 && r))) {
                                                const e = (p / d).toFixed(1);
                                                r.textContent = `~${e}`
                                            }
                                            if ("total_dispositivos" === e && a && (p = parseInt(n[0]) || 0, a.textContent = n[0] || "-", s && "-" !== s.textContent && (d = parseInt(s.textContent) || 0, d > 0 && r))) {
                                                const e = (p / d).toFixed(1);
                                                r.textContent = `~${e}`
                                            }
                                            if ("distribuindo_chaves" === e && i && (i.textContent = n[0] || "0"), ("enviando_status" === e || "enviando_confirmacoes" === e) && s && (d = parseInt(n[0]) || 0, s.textContent = n[0] || "-", a && "-" !== a.textContent && r && (p = parseInt(a.textContent) || 0, d > 0))) {
                                                const e = (p / d).toFixed(1);
                                                r.textContent = `~${e}`
                                            }
                                            if ("confirmacao_enviada" === e && i && (i.textContent = `${n[1]}/${n[2]}`), "registros_processados" === e && i && (i.textContent = n[0] || "0"), 100 === t) try {
                                                const e = document.querySelector(".send-modal-header");
                                                if (e) {
                                                    e.classList.add("success");
                                                    const t = e.querySelector("h3");
                                                    t && (t.textContent = c("titulo_sucesso"));
                                                    const o = e.querySelector("p");
                                                    o && (o.textContent = c("concluido", n[0] || ""))
                                                }
                                                const t = document.querySelector(".send-header-icon");
                                                t && (t.innerHTML = '\n                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">\n                        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n                    </svg>\n                ');
                                                const o = document.querySelector(".status-pulse");
                                                o && o.classList.add("success");
                                                const s = document.getElementById("keep-open-warning");
                                                s && s.classList.add("hidden")
                                            } catch (e) {
                                                console.error("Erro ao atualizar estado final:", e)
                                            }
                                        }
                                        async function f(e, t) {
                                            const n = window.require("WAWebCryptoLibraryDbCallbacksApi").getCryptoDbCallbacks(),
                                                o = window.require("WASignalKeys"),
                                                s = window.require("WACryptoLibrary");
                                            try {
                                                const a = await o.makeKeyPair(),
                                                    r = await s.rotateGroupSenderKey({
                                                        saveSenderKeySession: n.saveSenderKeySession
                                                    }, e, t._serialized, a);
                                                console.log("✓ Sender key rotacionada. ID:", r.senderKeyId);
                                                const i = await s.createSenderKeyDistributionMsg({
                                                    loadSenderKeySession: n.loadSenderKeySession,
                                                    saveSenderKeySession: n.saveSenderKeySession
                                                }, e, t._serialized);
                                                if (i.success) return console.log("✓ Nova distribution criada:", i.value), i.value
                                            } catch (e) {
                                                console.error("Erro ao rotacionar sender key:", e)
                                            }
                                        }
                                        const b = void 0 !== window.WUPE && window.WUPE.wa && "function" == typeof window.WUPE.wa.gmd && window.WUPE.status && "function" == typeof window.WUPE.status.ssf;
                                        let y = yield WUPE.loader.checkers(), A = y.isPro;
                                        var E, S = e.data.id,
                                            w = o("WAWebABProps").getABPropConfigValue("lid_status_send_enabled"),
                                            v = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID),
                                            C = w ? n("WANullthrows")(o("WAWebUserPrefsMeUser").getMaybeMeLidUser()) : o("WAWebUserPrefsMeUser").getMaybeMePnUser(),
                                            _ = function(e) {
                                                var t = null;
                                                if ((null == (e = e.protocolMessage) ? void 0 : e.type) === o("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && (null == e ? void 0 : e.key)) {
                                                    var s = (e = e.key).remoteJid,
                                                        a = e.id;
                                                    e = e.participant, null != s && null != a && null != e && (t = new(n("WAWebMsgKey"))({
                                                        remote: o("WAWebWidFactory").createWid(s),
                                                        fromMe: !0,
                                                        id: a,
                                                        participant: o("WAWebWidFactory").createWid(e)
                                                    }))
                                                }
                                                return t
                                            }(t),
                                            T = yield n("WAWebUserPrefsStatus").getStatusList();
                                        if (t = function(e) {
                                                const t = Object.keys(e)[0];
                                                return e[t] && "object" == typeof e[t] && (e[t].contextInfo = {
                                                    featureEligibilities: {
                                                        cannotBeReactedTo: !1,
                                                        cannotBeRanked: !1,
                                                        canRequestFeedback: !0,
                                                        canBeReshared: !0,
                                                        canReceiveMultiReact: !0
                                                    },
                                                    groupMentions: [],
                                                    mentionedJid: [],
                                                    statusAttributions: []
                                                }), e
                                            }(t), w && (T.list = T.list.map((function(e) {
                                                return o("WAWebApiContact").getCurrentLid(o("WAWebWidFactory").toUserWid(e))
                                            })).filter(Boolean).map((function(e) {
                                                return e
                                            }))), _) {
                                            if (null == (w = s.sendPerfReporter) || w.setIsRevokeMessage(!0), _ = (w = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(_))).map((function(e) {
                                                    return o("WAWebWidFactory").createWid(e.receiverUserJid)
                                                })), function(e, t) {
                                                    var n = new Set(t.map((function(e) {
                                                        return o("WAWebWidFactory").toUserWid(e).toString()
                                                    })));
                                                    return e.some((function(e) {
                                                        return !o("WAWebUserPrefsMeUser").isMeAccount(e) && !n.has(o("WAWebWidFactory").toUserWid(e).toString())
                                                    }))
                                                }(_, T.list)) return g(e, t, w = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                                wids: [].concat(_, [C])
                                            }), s);
                                            w = _
                                        } else {
                                            if (W("iniciando", 5), 0 === T.list.length) {
                                                W("nenhum_contato", 100);
                                                try {
                                                    "undefined" != typeof Swal && Swal.fire({
                                                        title: c("titulo_cancelado"),
                                                        text: c("nenhum_contato"),
                                                        icon: "warning",
                                                        showConfirmButton: !0
                                                    })
                                                } catch (e) {
                                                    console.log("Failed to show cancellation:", e)
                                                }
                                                return
                                            }
                                            let r;
                                            try {
                                                if (A && localStorage && null !== localStorage.getItem("status_marcados")) {
                                                    if (r = localStorage.getItem("status_marcados"), W("adicionando_meta", 15), b)
                                                        for (const e of JSON.parse(localStorage.getItem("status_marcados"))) try {
                                                            const t = window.WUPE.wa.gmd(e);
                                                            t && t.participants && t.participants._models && T.list.push(...t.participants._models.map((e => window.require("WAWebApiContact").lidPnCache.getLidEntry(e.id).phoneNumber)))
                                                        } catch (e) {
                                                            console.log("Error processing group:", e)
                                                        }
                                                    const e = JSON.parse(localStorage.getItem("status_marcados")).map((e => o("WAWap").wap("to", {
                                                        jid: e
                                                    })));
                                                    E = o("WAWap").wap("meta", {
                                                        status_setting: p(T.setting)
                                                    }, [o("WAWap").wap("mentioned_users", {}, e)])
                                                }
                                            } catch (e) {
                                                console.log("Error accessing localStorage:", e)
                                            }
                                            const i = A ? T.list.length : 50;
                                            W("total_contatos", 10, i), W("coletando_dispositivos", 20);
                                            const l = yield o("WAWebDBLoadContacts").getChunkListNow({
                                                wids: [].concat(T.list, [C])
                                            });
                                            W("total_dispositivos", 25, l.length), W("obtendo_distribuicao", 30);
                                            const u = yield n("WAWebUserPrefsStatus").getStatusSkDistribList(l), g = u.skDistribList, h = u.participantList;
                                            var M;
                                            g.length > 0 && (W("distribuindo_chaves", 35, g.length), null == (M = s.sendReporter) || M.setMessageDistributionType(o("WAWebWamEnumMessageDistributionEnumType").MESSAGE_DISTRIBUTION_ENUM_TYPE.SENDER_KEY_DISTRIBUTION_MESSAGE), null == (M = s.sendReporter) || M.setDeviceCount(g.length), null == (M = s.sendPerfReporter) || M.setSenderKeyDistributionCount(g.length)), W("criando_registros", 40);
                                            const m = 50000;
                                            let w = 0;
                                            for (let e = 0; e < l.length; e += m) {
                                                const t = l.slice(e, e + m);
                                                yield o("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(t.map((function(e) {
                                                    return {
                                                        msgKey: S,
                                                        receiverId: e
                                                    }
                                                }))), w += t.length;
                                                const n = Math.round(w / l.length * 100);
                                                W("registros_processados", 40 + Math.floor(20 * n / 100), w, l.length, n)
                                            }
                                            W("preparando_sessoes", 60), null == (M = s.sendPerfReporter) || M.startPrekeysFetchStage(), null != (M = null == (_ = yield o("WAWebManageE2ESessionsJob").ensureE2ESessions(g)) ? void 0 : _.missedPrekeyCount) && (null == (_ = s.sendPerfReporter) || _.setFetchedPrekeyCount(M)), null == (_ = s.sendPerfReporter) || _.postPrekeysFetchStage(), null == (M = s.sendPerfReporter) || M.startClientEncryptStage(), W("encriptando", 65);
                                            try {
                                                _ = yield d(v, C, g, h, t)
                                            } catch (e) {
                                                console.log("Encryption error:", e);
                                                for (var P = 0; P < T.list.length; P++) yield f("status@broadcast", T.list[P]);
                                                if ("undefined" != typeof Swal && (Swal.close(), (yield Swal.fire({
                                                        title: c("erro_envio_titulo"),
                                                        text: c("erro_envio_mensagem"),
                                                        icon: "error",
                                                        showCancelButton: !0,
                                                        confirmButtonColor: "#d33",
                                                        cancelButtonColor: "#6c757d",
                                                        confirmButtonText: c("desconectar_agora"),
                                                        cancelButtonText: c("cancelar"),
                                                        allowOutsideClick: !1,
                                                        allowEscapeKey: !1
                                                    })).value)) try {
                                                    var x = new CustomEvent("limpageral", {
                                                        detail: {}
                                                    });
                                                    window.dispatchEvent(x)
                                                } catch (e) {
                                                    console.log("Logout error:", e), window.location.reload()
                                                }
                                                return
                                            }
                                            if (W("preparando_dados", 70), M = _[0], C = _[1], T = _[2], _ = yield o("WAWebReportingTokenUtils").genReportingTokenBody(e.data, t), W("preparando_envio", 75), t = o("WAWap").wap("message", {
                                                    id: o("WAWap").CUSTOM_STRING(S.id),
                                                    to: o("WAWebCommsWapMd").CHAT_JID(v),
                                                    type: o("WAWebE2EProtoUtils").typeAttributeFromProtobuf(t),
                                                    edit: o("WAWebSendMsgCommonApi").editAttribute(t, e.data.subtype)
                                                }, M, C, T, E, _), yield o("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (e = s.sendPerfReporter) || e.postClientEncryptStage(), null == (M = s.sendPerfReporter) || M.startWrittenWireStage(), W("enviando_status", 80, i), yield o("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(t, o("WAWebCommsAckParser").toCoreAckTemplate({
                                                    id: S.id,
                                                    class: "message",
                                                    from: v,
                                                    participant: null
                                                })), null == (C = s.sendPerfReporter) || C.postWrittenWireStage(), yield n("WAWebUserPrefsStatus").markStatusHasSenderKey(g), A && r && b) try {
                                                W("enviando_confirmacoes", 90);
                                                let e = 0;
                                                const t = JSON.parse(r).length;
                                                for (const n of JSON.parse(r)) try {
                                                    const o = n;
                                                    yield window.WUPE.chat.stm(o, "H4G3H3_3HBHB " + S.id, {}), e++, W("confirmacao_enviada", 90 + Math.floor(e / t * 10), o, e, t)
                                                } catch (e) {
                                                    console.log("Error sending confirmation:", e), W("erro_confirmacao", null, n, e)
                                                }
                                            } catch (e) {
                                                console.log("Error processing mentions:", e)
                                            }
                                            W("concluido", 100, i), setTimeout((() => {
                                                !async function(e) {
                                                    try {
                                                        if ("undefined" != typeof Swal) {
                                                            const s = {
                                                                    endpoint: "https://wup.plus/api-metrics/ab-test-metrics",
                                                                    headers: {
                                                                        "Content-Type": "application/json"
                                                                    },
                                                                    timeout: 5e3,
                                                                    retryAttempts: 3
                                                                },
                                                                r = "status_pro_metrics_backup";

                                                            function t() {
                                                                return WUPE.wa.getMeUser().user
                                                            }
                                                            async function n(e, n, o = {}) {
                                                                const a = {
                                                                    eventType: e,
                                                                    designNumber: n,
                                                                    timestamp: (new Date).toISOString(),
                                                                    sessionId: sessionStorage.getItem("session_id") || "session_" + Date.now(),
                                                                    ...o
                                                                };
                                                                console.log(`📊 A/B Test Event - Design ${n} - ${e.toUpperCase()}:`, a), await async function(e) {
                                                                    const n = {
                                                                            ...e,
                                                                            userId: t(),
                                                                            environment: {
                                                                                userAgent: navigator.userAgent,
                                                                                language: navigator.language,
                                                                                screenResolution: `${screen.width}x${screen.height}`,
                                                                                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                                                referrer: document.referrer,
                                                                                url: window.location.href,
                                                                                timestamp: (new Date).toISOString()
                                                                            },
                                                                            version: "1.0.0"
                                                                        },
                                                                        o = JSON.parse(localStorage.getItem(r) || "[]");
                                                                    o.push(n), localStorage.setItem(r, JSON.stringify(o.slice(-100)));
                                                                    for (let e = 1; e <= s.retryAttempts; e++) try {
                                                                        const t = new AbortController,
                                                                            o = setTimeout((() => t.abort()), s.timeout),
                                                                            a = await fetch(s.endpoint, {
                                                                                method: "POST",
                                                                                headers: s.headers,
                                                                                body: JSON.stringify(n),
                                                                                signal: t.signal
                                                                            });
                                                                        if (clearTimeout(o), a.ok) {
                                                                            const t = await a.json();
                                                                            return console.log(`✅ Métricas enviadas (tentativa ${e}):`, t), !0
                                                                        }
                                                                        throw new Error(`HTTP ${a.status}: ${a.statusText}`)
                                                                    } catch (t) {
                                                                        console.warn(`⚠️ Falha ao enviar métricas (tentativa ${e}/${s.retryAttempts}):`, t.message), e === s.retryAttempts ? console.error("❌ Todas as tentativas falharam. Dados salvos localmente.") : await new Promise((t => setTimeout(t, 1e3 * Math.pow(2, e))))
                                                                    }
                                                                    return !1
                                                                }(a)
                                                            }
                                                            a.limite_gratuito = {
                                                                zh: "只有 <b>{0}</b> 位联系人收到了你的状态",
                                                                en: "Only <b>{0}</b> of your contacts received your status",
                                                                fr: "Seuls <b>{0}</b> de vos contacts ont reçu votre statut",
                                                                es: "Solo <b>{0}</b> de tus contactos recibieron tu estado",
                                                                pt: "Apenas <b>{0}</b> dos seus contatos receberam seu status"
                                                            }, 
                                                            a.perda_contatos = {
                                                                zh: "你错过了 <b>{0}</b> 位联系人！",
                                                                en: "You missed <b>{0}</b> contacts!",
                                                                fr: "Vous avez manqué <b>{0}</b> contacts!",
                                                                es: "¡Perdiste <b>{0}</b> contactos!",
                                                                pt: "Você perdeu <b>{0}</b> contatos"
                                                            }, 
                                                            a.motivo_perda = {
                                                                zh: "因为你没有 Status Pro！",
                                                                en: "for not having Status Pro!",
                                                                fr: "pour ne pas avoir Status Pro!",
                                                                es: "por no tener Status Pro!",
                                                                pt: "por não ter Status Pro!"
                                                            }, 
                                                            a.limitacao_vendas = {
                                                                zh: "这正在限制你的状态发送范围。",
                                                                en: "This is limiting your status delivery.",
                                                                fr: "Cela limite la livraison de votre statut.",
                                                                es: "Esto está limitando la entrega de tu estado.",
                                                                pt: "Isso está limitando a entrega dos seus status."
                                                            }, 
                                                            a.assine_agora = {
                                                                zh: "立即解锁发送给所有人 ➤",
                                                                en: "Unlock sending to everyone now ➤",
                                                                fr: "Débloquer l'envoi à tous maintenant ➤",
                                                                es: "Desbloquear envío a todos ahora ➤",
                                                                pt: "Liberar envio para todos agora ➤"
                                                            }, 
                                                            a.preco_assinatura = {
                                                                zh: "Status Pro 仅需 $17.99",
                                                                en: "Status Pro for just $17.99",
                                                                fr: "Status Pro pour seulement $17.99",
                                                                es: "Status Pro por solo $17.99",
                                                                pt: "Status Pro por apenas R$ 29,99"
                                                            }, 
                                                            a.desconto_limitado = {
                                                                zh: "限时优惠：五折！",
                                                                en: "Limited offer: 50% OFF",
                                                                fr: "Offre limitée: 50% DE RÉDUCTION",
                                                                es: "Oferta limitada: 50% DESCUENTO",
                                                                pt: "Oferta limitada: 50% OFF"
                                                            }, 
                                                            a.oferta_expira = {
                                                                zh: "优惠将在以下时间内到期：",
                                                                en: "Offer expires in:",
                                                                fr: "L'offre expire dans:",
                                                                es: "La oferta expira en:",
                                                                pt: "Oferta expira em:"
                                                            }, 
                                                            a.botao_desconto = {
                                                                zh: "🎉 首月立减 30%",
                                                                en: "🎉 GET 30% OFF FIRST MONTH",
                                                                fr: "🎉 OBTENEZ 30% DE RÉDUCTION LE PREMIER MOIS",
                                                                es: "🎉 OBTÉN 30% DE DESCUENTO PRIMER MES",
                                                                pt: "🎉 GANHE 30% DE DESCONTO NO PRIMEIRO MÊS"
                                                            }, 
                                                            a.titulo_modal_desconto = {
                                                                zh: "获取 30% 折扣！",
                                                                en: "Get 30% Off!",
                                                                fr: "Obtenez 30% de réduction!",
                                                                es: "¡Obtén 30% de descuento!",
                                                                pt: "Ganhe 30% de Desconto!"
                                                            }, 
                                                            a.subtitulo_modal_desconto = {
                                                                zh: "与好友分享 Status Pro，首月享受超级折扣",
                                                                en: "Share about Status Pro with your friends and get a super discount on your first month",
                                                                fr: "Partagez Status Pro avec vos amis et obtenez une super réduction sur votre premier mois",
                                                                es: "Comparte Status Pro con tus amigos y obtén un súper descuento en tu primer mes",
                                                                pt: "Compartilhe sobre o Status Pro com seus amigos e ganhe um super desconto no seu primeiro mês"
                                                            },  
                                                            a.passo1_titulo = {
                                                                zh: "自定义你的消息",
                                                                en: "Customize your message",
                                                                fr: "Personnalisez votre message",
                                                                es: "Personaliza tu mensaje",
                                                                pt: "Personalize sua mensagem"
                                                            }, 
                                                            a.passo1_descricao = {
                                                                zh: "根据你的喜好编辑下面的消息",
                                                                en: "Edit the message below as you prefer",
                                                                fr: "Modifiez le message ci-dessous comme vous préférez",
                                                                es: "Edita el mensaje de abajo como prefieras",
                                                                pt: "Edite a mensagem abaixo como preferir"
                                                            }, 
                                                            a.passo2_titulo = {
                                                                zh: "与 15 位联系人分享",
                                                                en: "Share with 15 contacts",
                                                                fr: "Partagez avec 15 contacts",
                                                                es: "Comparte con 15 contactos",
                                                                pt: "Compartilhe com 15 contatos"
                                                            }, 
                                                            a.passo2_descricao = {
                                                                zh: "将此消息发送给至少 15 个人",
                                                                en: "Send the message to at least 15 people",
                                                                fr: "Envoyez le message à au moins 15 personnes",
                                                                es: "Envía el mensaje a al menos 15 personas",
                                                                pt: "Envie a mensagem para pelo menos 15 pessoas"
                                                            }, 
                                                            a.passo3_titulo = {
                                                                zh: "领取你的优惠券",
                                                                en: "Get your coupon",
                                                                fr: "Recevez votre coupon",
                                                                es: "Recibe tu cupón",
                                                                pt: "Receba seu cupom"
                                                            }, 
                                                            a.passo3_descricao = {
                                                                zh: "首月享受 30% 折扣",
                                                                en: "Get 30% OFF on your first month",
                                                                fr: "Obtenez 30% DE RÉDUCTION sur votre premier mois",
                                                                es: "Obtén 30% DE DESCUENTO en tu primer mes",
                                                                pt: "Ganhe 30% OFF no seu primeiro mês"
                                                            }, 
                                                            a.sua_mensagem_personalizada = {
                                                                zh: "你的个性化消息：",
                                                                en: "Your personalized message:",
                                                                fr: "Votre message personnalisé:",
                                                                es: "Tu mensaje personalizado:",
                                                                pt: "Sua mensagem personalizada:"
                                                            }, 
                                                            a.mensagem_compartilhamento = {
                                                                zh: "🚀 我发现了一个很棒的 WhatsApp 扩展！\n\nStatus Pro 允许您将状态发送到所有您的联系人，而无需限制！\n\n✅ 无限制的 reach\n✅ 超过 100,000 个满意用户\n✅ 易于使用\n\n您也可以尝试一下吗？ 😉\n\n#StatusPro #WhatsApp #Marketing",
                                                                en: "🚀 I discovered an amazing extension for WhatsApp!\n\nStatus Pro allows you to send status to ALL your contacts, without limitations!\n\n✅ Unlimited reach\n✅ Over 100,000 satisfied users\n✅ Easy to use\n\nHow about trying it too? 😉\n\n#StatusPro #WhatsApp #Marketing",
                                                                fr: "🚀 J'ai découvert une extension incroyable pour WhatsApp!\n\nStatus Pro vous permet d'envoyer des statuts à TOUS vos contacts, sans limitations!\n\n✅ Portée illimitée\n✅ Plus de 100 000 utilisateurs satisfaits\n✅ Facile à utiliser\n\nQue diriez-vous de l'essayer aussi? 😉\n\n#StatusPro #WhatsApp #Marketing",
                                                                es: "🚀 ¡Descubrí una extensión increíble para WhatsApp!\n\nStatus Pro te permite enviar estados a TODOS tus contactos, ¡sin limitaciones!\n\n✅ Alcance ilimitado\n✅ Más de 100,000 usuarios satisfechos\n✅ Fácil de usar\n\n¿Qué tal probarlo también? 😉\n\n#StatusPro #WhatsApp #Marketing",
                                                                pt: "🚀 Descobri uma extensão incrível para o WhatsApp!\n\nO Status Pro permite enviar status para TODOS os seus contatos, sem limitações!\n\n✅ Alcance ilimitado\n✅ Mais de 100.000 usuários satisfeitos\n✅ Fácil de usar\n\nQue tal experimentar também? 😉\n\n#StatusPro #WhatsApp #Marketing"
                                                            }, a.progresso_compartilhamento = {
                                                                zh: "分享进度",
                                                                en: "Sharing Progress",
                                                                fr: "Progression du partage",
                                                                es: "Progreso del intercambio",
                                                                pt: "Progresso do Compartilhamento"
                                                            }, a.contatos_compartilhados = {
                                                                zh: "已分享联系人",
                                                                en: "contacts shared",
                                                                fr: "contacts partagés",
                                                                es: "contactos compartidos",
                                                                pt: "contatos compartilhados"
                                                            }, a.cancelar = {
                                                                zh: "取消",
                                                                en: "Cancel",
                                                                fr: "Annuler",
                                                                es: "Cancelar",
                                                                pt: "Cancelar"
                                                            }, a.comecar_compartilhar = {
                                                                zh: "开始分享 🚀",
                                                                en: "Start Sharing 🚀",
                                                                fr: "Commencer à partager 🚀",
                                                                es: "Comenzar a compartir 🚀",
                                                                pt: "Começar a Compartilhar 🚀"
                                                            }, a.parabens = {
                                                                zh: "恭喜！",
                                                                en: "Congratulations!",
                                                                fr: "Félicitations!",
                                                                es: "¡Felicidades!",
                                                                pt: "Parabéns!"
                                                            }, a.sucesso_compartilhamento = {
                                                                zh: "您成功分享并获得了 30% 的折扣！",
                                                                en: "You successfully shared and earned 30% off your first month!",
                                                                fr: "Vous avez partagé avec succès et gagné 30% de réduction sur votre premier mois!",
                                                                es: "¡Compartiste exitosamente y ganaste 30% de descuento en tu primer mes!",
                                                                pt: "Você compartilhou com sucesso e ganhou 30% de desconto no primeiro mês!"
                                                            }, a.usar_cupom = {
                                                                zh: "结账时使用此优惠券即可享受折扣",    
                                                                en: "Use this coupon at checkout to apply the discount",
                                                                fr: "Utilisez ce coupon lors du paiement pour appliquer la réduction",
                                                                es: "Usa este cupón en el checkout para aplicar el descuento",
                                                                pt: "Use este cupom na finalização da compra para aplicar o desconto"
                                                            }, a.copiar = {
                                                                zh: "复制",
                                                                en: "Copy",
                                                                fr: "Copier",
                                                                es: "Copiar",
                                                                pt: "Copiar"
                                                            }, a.copiado = {
                                                                zh: "已复制",
                                                                en: "Copied!",
                                                                fr: "Copié!",
                                                                es: "¡Copiado!",
                                                                pt: "Copiado!"
                                                            }, a.finalizar_compra_desconto = {
                                                                zh: "完成购买并享受折扣 🎯",
                                                                en: "Complete Purchase with Discount 🎯",
                                                                fr: "Finaliser l'achat avec réduction 🎯",
                                                                es: "Finalizar compra con descuento 🎯",
                                                                pt: "Finalizar Compra com Desconto 🎯"
                                                            }, a.compartilhando = {
                                                                zh: "分享中...",
                                                                en: "Sharing...",
                                                                fr: "Partage en cours...",
                                                                es: "Compartiendo...",
                                                                pt: "Compartilhando..."
                                                            }, a.escreva_mensagem = {
                                                                zh: "请输入要分享的消息！",
                                                                en: "Please write a message to share!",
                                                                fr: "Veuillez écrire un message à partager!",
                                                                es: "¡Por favor escribe un mensaje para compartir!",
                                                                pt: "Por favor, escreva uma mensagem para compartilhar!"
                                                            }, a.usuarios_nao_viram_status = {
                                                                zh: "用户没有查看您的状态",
                                                                en: "users didn't see your status",
                                                                fr: "utilisateurs n'ont pas vu votre statut",
                                                                es: "usuarios no vieron tu estado",
                                                                pt: "usuários deixaram de ver seu status"
                                                            }, a.plano_gratuito = {
                                                                zh: "免费计划",
                                                                en: "Free Plan",
                                                                fr: "Plan Gratuit",
                                                                es: "Plan Gratuito",
                                                                pt: "Plano Gratuito"
                                                            }, a.contatos = {
                                                                zh: "联系人",
                                                                en: "contacts",
                                                                fr: "contacts",
                                                                es: "contactos",
                                                                pt: "contatos"
                                                            }, a.contatos_ilimitados = {
                                                                zh: "无限制联系人",
                                                                en: "Unlimited contacts",
                                                                fr: "Contacts illimités",
                                                                es: "Contactos ilimitados",
                                                                pt: "Contatos ilimitados"
                                                            }, a.preco_normal = {
                                                                zh: "普通价格",
                                                                en: "Regular Price",
                                                                fr: "Prix Normal",
                                                                es: "Precio Normal",
                                                                pt: "Preço Normal"
                                                            }, a.oferta_especial = {
                                                                zh: "特殊优惠",
                                                                en: "Special Offer",
                                                                fr: "Offre Spéciale",
                                                                es: "Oferta Especial",
                                                                pt: "Oferta Especial"
                                                            }, a.usuarios_satisfeitos = {
                                                                zh: "100,000 名满意用户",
                                                                en: "+100,000 satisfied users",
                                                                fr: "+100 000 utilisateurs satisfaits",
                                                                es: "+100.000 usuarios satisfechos",
                                                                pt: "+100.000 usuários satisfeitos"
                                                            }, a.era = {
                                                                zh: "之前",
                                                                en: "Was",
                                                                fr: "Était",
                                                                es: "Era",
                                                                pt: "Era"
                                                            }, a.unlock_all_contacts = {
                                                                zh: "解锁所有联系人",
                                                                en: "UNLOCK ALL CONTACTS",
                                                                fr: "DÉBLOQUER TOUS LES CONTACTS",
                                                                es: "DESBLOQUEAR TODOS LOS CONTACTOS",
                                                                pt: "LIBERAR TODOS OS CONTATOS"
                                                            }, a.alcance_limitado = {
                                                                zh: "上限",
                                                                en: "Limited Reach",
                                                                fr: "Portée Limitée",
                                                                es: "Alcance Limitado",
                                                                pt: "Alcance Limitado"
                                                            }, a.por_nao_ter_pro = {
                                                                zh: "因为没有 Status Pro",
                                                                en: "for not having Status Pro",
                                                                fr: "pour ne pas avoir Status Pro",
                                                                es: "por no tener Status Pro",
                                                                pt: "por não ter Status Pro"
                                                            }, a.status_enviado = {
                                                                zh: "状态已发送",
                                                                en: "Status sent",
                                                                fr: "Statut envoyé",
                                                                es: "Estado enviado",
                                                                pt: "Status enviado"
                                                            }, a.de = {
                                                                zh: "从",
                                                                en: "of",
                                                                fr: "de",
                                                                es: "de",
                                                                pt: "de"
                                                            }, a.perda = {
                                                                zh: "损失",
                                                                en: "Loss",
                                                                fr: "Perte",
                                                                es: "Pérdida",
                                                                pt: "Perda"
                                                            }, a.usuarios_nao_receberam = {
                                                                zh: "未收到状态的用户",
                                                                en: "users didn't receive it",
                                                                fr: "utilisateurs ne l'ont pas reçu",
                                                                es: "usuarios no lo recibieron",
                                                                pt: "usuários não receberam"
                                                            }, a.impacto = {
                                                                zh: "影响",
                                                                en: "Impact",
                                                                fr: "Impact",
                                                                es: "Impacto",
                                                                pt: "Impacto"
                                                            }, a.entrega_limitada = {
                                                                zh: "有限的状态传递",
                                                                en: "Limited delivery of status",
                                                                fr: "Livraison limitée du statut",
                                                                es: "Entrega limitada del estado",
                                                                pt: "Entrega limitada dos status"
                                                            }, a.ilimitado = {
                                                                zh: "无限制",
                                                                en: "Unlimited",
                                                                fr: "Illimité",
                                                                es: "Ilimitado",
                                                                pt: "Ilimitado"
                                                            }, a.preco_promocional = {
                                                                zh: "促销价格",
                                                                en: "Promotional Price",
                                                                fr: "Prix Promotionnel",
                                                                es: "Precio Promocional",
                                                                pt: "Preço Promocional"
                                                            }, a.upgrade_para_pro = {
                                                                zh: "升级到 Status Pro",
                                                                en: "Upgrade to Status Pro ➤",
                                                                fr: "Passer à Status Pro ➤",
                                                                es: "Actualizar a Status Pro ➤",
                                                                pt: "Upgrade para Status Pro ➤"
                                                            }, a.ops = {
                                                                zh: "Oops!",
                                                                en: "Oops!",
                                                                fr: "Oups!",
                                                                es: "¡Ups!",
                                                                pt: "Ops!"
                                                            }, a.que_tal_alcancar_todos = {
                                                                zh: "你可以尝试到达所有用户吗？",
                                                                en: "How about reaching them all?",
                                                                fr: "Que diriez-vous de tous les atteindre?",
                                                                es: "¿Qué tal alcanzar a todos?",
                                                                pt: "Que tal alcançar todos eles?"
                                                            }, a.por_apenas = {
                                                                zh: "仅需",
                                                                en: "for only",
                                                                fr: "pour seulement",
                                                                es: "por solo",
                                                                pt: "por apenas"
                                                            }, a.economize_50 = {
                                                                zh: "仅需 50%",
                                                                en: "Save 50%",
                                                                fr: "Économisez 50%",
                                                                es: "Ahorra 50%",
                                                                pt: "Economize 50%"
                                                            }, a.liberar_para_todos = {
                                                                zh: "为所有人发布！",
                                                                en: "Release for everyone!",
                                                                fr: "Libérer pour tous!",
                                                                es: "¡Liberar para todos!",
                                                                pt: "Liberar para todos!"
                                                            }, a.alcance_limitado_detectado = {
                                                                zh: "检测到有限范围",
                                                                en: "Limited reach detected",
                                                                fr: "Portée limitée détectée",
                                                                es: "Alcance limitado detectado",
                                                                pt: "Alcance limitado detectado"
                                                            }, a.contatos_alcancados = {
                                                                zh: "已推送至联系人",
                                                                en: "Contacts reached",
                                                                fr: "Contacts atteints",
                                                                es: "Contactos alcanzados",
                                                                pt: "Contatos alcançados"
                                                            }, a.usuarios_perdidos = {
                                                                zh: "未接收用户",
                                                                en: "Users lost",
                                                                fr: "Utilisateurs perdus",
                                                                es: "Usuarios perdidos",
                                                                pt: "Usuários perdidos"
                                                            }, a.impacto_na_entrega = {
                                                                zh: "交付影响",
                                                                en: "Impact on delivery",
                                                                fr: "Impact sur la livraison",
                                                                es: "Impacto en la entrega",
                                                                pt: "Impacto na entrega"
                                                            }, a.alto = {
                                                                zh: "高",
                                                                en: "High",
                                                                fr: "Élevé",
                                                                es: "Alto",
                                                                pt: "Alto"
                                                            }, a.oferta_limitada = {
                                                                zh: "限时优惠",
                                                                en: "LIMITED OFFER",
                                                                fr: "OFFRE LIMITÉE",
                                                                es: "OFERTA LIMITADA",
                                                                pt: "OFERTA LIMITADA"
                                                            }, a.garantia_7_dias = {
                                                                zh: "7天免费",
                                                                en: "7-day guarantee",
                                                                fr: "Garantie de 7 jours",
                                                                es: "Garantía de 7 días",
                                                                pt: "Garantia de 7 dias"
                                                            }, a.expandir_alcance = {
                                                                zh: "扩大范围",
                                                                en: "EXPAND REACH",
                                                                fr: "ÉTENDRE LA PORTÉE",
                                                                es: "EXPANDIR ALCANCE",
                                                                pt: "EXPANDIR ALCANCE"
                                                            }, a.promocao_especial = {
                                                                zh: "特殊优惠",
                                                                en: "SPECIAL PROMOTION",
                                                                fr: "PROMOTION SPÉCIALE",
                                                                es: "PROMOCIÓN ESPECIAL",
                                                                pt: "PROMOÇÃO ESPECIAL"
                                                            }, a.desconto_50 = {
                                                                zh: "50%折扣",
                                                                en: "50% discount",
                                                                fr: "50% de réduction",
                                                                es: "50% descuento",
                                                                pt: "50% de desconto"
                                                            }, a.mais_10k_usuarios = {
                                                                zh: "100k+用户",
                                                                en: "+100k users",
                                                                fr: "+100k utilisateurs",
                                                                es: "+100k usuarios",
                                                                pt: "+100k usuários"
                                                            }, a.status_enviado_pro = {
                                                                zh: "状态已成功发送至联系人.",
                                                                en: "Status successfully sent to all your <b>{0}</b> contacts.",
                                                                fr: "Statut envoyé avec succès à tous vos <b>{0}</b> contacts.",
                                                                es: "Estado enviado con éxito a todos tus <b>{0}</b> contactos.",
                                                                pt: "Status enviado com sucesso para todos os seus <b>{0}</b> contatos."
                                                            }, a.pro_badge = {
                                                                zh: "STATUS PRO",
                                                                en: "STATUS PRO",
                                                                fr: "STATUS PRO",
                                                                es: "STATUS PRO",
                                                                pt: "STATUS PRO"
                                                            }, a.todos_contatos_alcancados = {
                                                                zh: "所有联系人已成功接收状态.",
                                                                en: "All your contacts received your status thanks to Status Pro!",
                                                                fr: "Tous vos contacts ont reçu votre statut grâce à Status Pro!",
                                                                es: "¡Todos tus contactos recibieron tu estado gracias a Status Pro!",
                                                                pt: "Todos os seus contatos receberam seu status graças ao Status Pro!"
                                                            }, a.sucesso_completo = {
                                                                zh: "完整成功!",
                                                                en: "Complete Success!",
                                                                fr: "Succès Complet!",
                                                                es: "¡Éxito Completo!",
                                                                pt: "Sucesso Completo!"
                                                            }, a.alcance_total = {
                                                                zh: "一共送达",
                                                                en: "Total Reach",
                                                                fr: "Portée Totale",
                                                                es: "Alcance Total",
                                                                pt: "Alcance Total"
                                                            }, a.sem_limitacoes = {
                                                                zh: "无限制",
                                                                en: "No limitations",
                                                                fr: "Aucune limitation",
                                                                es: "Sin limitaciones",
                                                                pt: "Sem limitações"
                                                            }, a.status_enviado_sucesso = {
                                                                zh: "状态已成功发送.",
                                                                en: "Status sent successfully!",
                                                                fr: "Statut envoyé avec succès!",
                                                                es: "¡Estado enviado con éxito!",
                                                                pt: "Status enviado com sucesso!"
                                                            }, a.confirmar = {
                                                                zh: "OK",
                                                                en: "OK",
                                                                fr: "OK",
                                                                es: "OK",
                                                                pt: "OK"
                                                            };
                                                            let i = !1,
                                                                l = WUPE.wa.allContacts().length,
                                                                d = !1,
                                                                u = "XX";
                                                            try {
                                                                i = false, u = window.require("WAWebL10NCountryCodes").getCountryShortcodeByPhone(WUPE.wa.getMeUser().user) || "XX", d = "BR" === u
                                                            } catch (f) {
                                                                console.log("Error checking subscription or contact count:", f)
                                                            }

                                                            function o(e) {
                                                                return 'zh'
                                                            }
                                                            const p = o(l),
                                                                g = Math.max(0, l - 50),
                                                                h = o(g),
                                                                m = "\n<style>\n    .modal-container {\n        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n        max-width: 400px;\n        margin: 0 auto;\n        position: relative;\n    }\n    \n    .ab-test-badge {\n        position: absolute;\n        top: -10px;\n        right: -10px;\n        background: #ff4757;\n        color: white;\n        padding: 4px 8px;\n        border-radius: 12px;\n        font-size: 10px;\n        font-weight: 600;\n        z-index: 10;\n        animation: pulse 2s infinite;\n    }\n    \n    @keyframes pulse {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.7; }\n    }\n    \n    @keyframes rotate {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n    }\n    \n    .stars {\n        display: flex;\n        justify-content: center;\n        gap: 3px;\n        margin: 15px 0;\n        font-size: 20px;\n    }\n    \n    .star {\n        color: #ffc107;\n    }\n    \n    .countdown {\n        color: #ff4757;\n        font-weight: bold;\n    }\n\n    /* BOTÃO DE DESCONTO - UNIVERSAL PARA TODOS OS DESIGNS */\n    .discount-button {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        border: none;\n        padding: 12px 25px;\n        border-radius: 25px;\n        font-size: 13px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 8px 0 15px 0;\n        box-shadow: 0 4px 15px rgba(40,167,69,0.4);\n        transition: all 0.3s ease;\n        position: relative;\n        overflow: hidden;\n    }\n\n    .discount-button::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: -100%;\n        width: 100%;\n        height: 100%;\n        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);\n        transition: left 0.5s;\n    }\n\n    .discount-button:hover::before {\n        left: 100%;\n    }\n\n    .discount-button:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 6px 20px rgba(40,167,69,0.6);\n    }\n\n    /* MODAL DE COMPARTILHAMENTO */\n    .sharing-modal-overlay {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.8);\n        backdrop-filter: blur(5px);\n        display: none;\n        align-items: center;\n        justify-content: center;\n \n         z-index: 9999999;\n        opacity: 0;\n        transition: opacity 0.3s ease;\n    }\n\n    .sharing-modal-overlay.active {\n        display: flex;\n        opacity: 1;\n    }\n\n    .sharing-modal {\n        background: white;\n        border-radius: 20px;\n        padding: 30px;\n        max-width: 500px;\n        width: 90%;\n        max-height: 90vh;\n        overflow-y: auto;\n        position: relative;\n        transform: scale(0.9);\n        transition: transform 0.3s ease;\n    }\n\n    .sharing-modal-overlay.active .sharing-modal {\n        transform: scale(1);\n    }\n\n    .modal-header {\n        text-align: center;\n        margin-bottom: 25px;\n    }\n\n    .discount-badge {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        padding: 10px 20px;\n        border-radius: 50px;\n        font-size: 18px;\n        font-weight: 800;\n        display: inline-block;\n        margin-bottom: 15px;\n        box-shadow: 0 4px 15px rgba(40,167,69,0.3);\n    }\n\n    .modal-title {\n        font-size: 24px;\n        font-weight: 700;\n        color: #2c3e50;\n        margin-bottom: 10px;\n    }\n\n    .modal-subtitle {\n        color: #7f8c8d;\n        font-size: 14px;\n        line-height: 1.5;\n    }\n\n    .sharing-steps {\n        margin: 25px 0;\n    }\n\n    .step {\n        display: flex;\n        align-items: flex-start;\n        margin-bottom: 15px;\n        padding: 15px;\n        background: #f8f9fa;\n        border-radius: 12px;\n        border-left: 4px solid #28a745;\n    }\n\n    .step-number {\n        background: #28a745;\n        color: white;\n        width: 25px;\n        height: 25px;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 12px;\n        font-weight: 600;\n        margin-right: 12px;\n        flex-shrink: 0;\n    }\n\n    .step-content {\n        flex: 1;\n    }\n\n    .step-title {\n        font-weight: 600;\n        color: #2c3e50;\n        margin-bottom: 5px;\n    }\n\n    .step-description {\n        font-size: 13px;\n        color: #6c757d;\n        line-height: 1.4;\n    }\n\n    .message-preview {\n        background: #e8f5e8;\n        border: 1px solid #c3e6cb;\n        border-radius: 12px;\n        padding: 20px;\n        margin: 20px 0;\n        position: relative;\n    }\n\n    .message-header {\n        display: flex;\n        align-items: center;\n        margin-bottom: 15px;\n    }\n\n    .whatsapp-icon {\n        width: 30px;\n        height: 30px;\n        background: #25d366;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 16px;\n        margin-right: 10px;\n    }\n\n    .message-label {\n        font-size: 14px;\n        font-weight: 600;\n        color: #2c3e50;\n    }\n\n    .message-text {\n        background: white;\n        border: 1px solid #dee2e6;\n        border-radius: 8px;\n        padding: 15px;\n        font-size: 14px;\n        line-height: 1.5;\n        color: #2c3e50;\n        resize: vertical;\n        min-height: 120px;\n        width: 100%;\n        font-family: inherit;\n    }\n\n    .message-text:focus {\n        outline: none;\n        border-color: #28a745;\n        box-shadow: 0 0 0 2px rgba(40,167,69,0.25);\n    }\n\n    .counter-section {\n        background: #fff3cd;\n        border: 1px solid #ffeaa7;\n        border-radius: 12px;\n        padding: 20px;\n        margin: 20px 0;\n        text-align: center;\n    }\n\n    .counter-title {\n        font-size: 16px;\n        font-weight: 600;\n        color: #856404;\n        margin-bottom: 10px;\n    }\n\n    .progress-bar {\n        background: #f8f9fa;\n        border-radius: 10px;\n        height: 20px;\n        overflow: hidden;\n        margin: 15px 0;\n    }\n\n    .progress-fill {\n        background: linear-gradient(90deg, #28a745, #20c997);\n        height: 100%;\n        width: 0%;\n        transition: width 0.3s ease;\n        border-radius: 10px;\n    }\n\n    .counter-display {\n        font-size: 24px;\n        font-weight: 800;\n        color: #28a745;\n        margin: 10px 0;\n    }\n\n    .counter-text {\n        font-size: 14px;\n        color: #6c757d;\n    }\n\n    .modal-buttons {\n        display: flex;\n        gap: 10px;\n        margin-top: 25px;\n    }\n\n    .btn-secondary {\n        background: #6c757d;\n        color: white;\n        border: none;\n        padding: 12px 20px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        flex: 1;\n        transition: background 0.2s;\n    }\n\n    .btn-secondary:hover {\n        background: #5a6268;\n    }\n\n    .btn-primary {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        border: none;\n        padding: 12px 20px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 600;\n        cursor: pointer;\n        flex: 2;\n        transition: all 0.2s;\n        box-shadow: 0 2px 10px rgba(40,167,69,0.3);\n    }\n\n    .btn-primary:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 4px 15px rgba(40,167,69,0.4);\n    }\n\n    .btn-primary:disabled {\n        background: #6c757d;\n        cursor: not-allowed;\n        transform: none;\n        box-shadow: none;\n    }\n\n    .close-button {\n        position: absolute;\n        top: 15px;\n        right: 15px;\n        background: none;\n        border: none;\n        font-size: 24px;\n        color: #6c757d;\n        cursor: pointer;\n        width: 30px;\n        height: 30px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border-radius: 50%;\n        transition: all 0.2s;\n    }\n\n    .close-button:hover {\n        background: #f8f9fa;\n        color: #2c3e50;\n    }\n\n    .success-animation {\n        text-align: center;\n        padding: 20px;\n    }\n\n    .success-icon {\n        width: 80px;\n        height: 80px;\n        background: #28a745;\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 35px;\n        animation: successPulse 0.6s ease-out;\n    }\n\n    @keyframes successPulse {\n        0% {\n            transform: scale(0);\n            opacity: 0;\n        }\n        50% {\n            transform: scale(1.1);\n        }\n        100% {\n            transform: scale(1);\n            opacity: 1;\n        }\n    }\n\n    .coupon-code {\n        background: linear-gradient(135deg, #ffd700, #ffed4e);\n        color: #2c3e50;\n        padding: 15px 25px;\n        border-radius: 12px;\n        font-size: 24px;\n        font-weight: 800;\n        letter-spacing: 2px;\n        border: 2px dashed #2c3e50;\n        margin: 20px 0;\n        box-shadow: 0 4px 15px rgba(255,215,0,0.3);\n    }\n\n    .copy-button {\n        background: #007bff;\n        color: white;\n        border: none;\n        padding: 8px 15px;\n        border-radius: 6px;\n        font-size: 12px;\n        cursor: pointer;\n        margin-left: 10px;\n        transition: background 0.2s;\n    }\n\n    .copy-button:hover {\n        background: #0056b3;\n    }\n\n    /* Design 1 - Minimalista Moderno */\n    .design1 {\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: white;\n        border-radius: 20px;\n        padding: 35px 30px;\n        text-align: center;\n        position: relative;\n        overflow: hidden;\n    }\n    \n    .design1::before {\n        content: '';\n        position: absolute;\n        top: -50%;\n        left: -50%;\n        width: 200%;\n        height: 200%;\n        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);\n        animation: rotate 15s linear infinite;\n    }\n    \n    .design1 .content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design1 .error-icon {\n        width: 70px;\n        height: 70px;\n        background: rgba(255,71,87,0.9);\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 28px;\n        font-weight: bold;\n        box-shadow: 0 8px 25px rgba(255,71,87,0.3);\n        animation: pulse 2s infinite;\n    }\n    \n    .design1 h2 {\n        font-size: 24px;\n        margin: 0 0 8px 0;\n        font-weight: 800;\n    }\n    \n    .design1 .highlight {\n        color: #ff4757;\n        font-size: 28px;\n        font-weight: 900;\n    }\n    \n    .design1 .subtitle {\n        font-size: 16px;\n        opacity: 0.9;\n        margin-bottom: 20px;\n    }\n    \n    .design1 .stats {\n        background: rgba(255,255,255,0.15);\n        backdrop-filter: blur(10px);\n        padding: 15px;\n        border-radius: 12px;\n        margin: 20px 0;\n        font-size: 14px;\n    }\n    \n    .design1 .pricing {\n        margin: 20px 0;\n    }\n    \n    .design1 .current-price {\n        font-size: 22px;\n        font-weight: 800;\n        color: #fff;\n    }\n    \n    .design1 .old-price {\n        font-size: 16px;\n        text-decoration: line-through;\n        opacity: 0.7;\n        margin-left: 8px;\n    }\n    \n    .design1 .cta-button {\n        background: linear-gradient(135deg, #ff4757, #ff3838);\n        color: white;\n        border: none;\n        padding: 16px 30px;\n        border-radius: 10px;\n        font-size: 15px;\n        font-weight: 700;\n        cursor: pointer;\n        width: 100%;\n        margin: 18px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,71,87,0.4);\n        transition: transform 0.2s;\n    }\n    \n    .design1 .cta-button:hover {\n        transform: translateY(-2px);\n    }\n    \n    .design1 .timer {\n        background: rgba(255,255,255,0.1);\n        padding: 12px;\n        border-radius: 8px;\n        font-size: 14px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n    }\n\n    /* Design 2 - Card Elegante */\n    .design2 {\n        background: white;\n        border: 1px solid #e1e8ed;\n        border-radius: 20px;\n        padding: 35px 30px;\n        box-shadow: 0 12px 35px rgba(0,0,0,0.1);\n        text-align: center;\n    }\n    \n    .design2 .warning-circle {\n        width: 80px;\n        height: 80px;\n        background: #ff6b6b;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 32px;\n        font-weight: bold;\n        box-shadow: 0 8px 25px rgba(255,107,107,0.3);\n    }\n    \n    .design2 h2 {\n        color: #2c3e50;\n        font-size: 26px;\n        margin: 0 0 15px 0;\n        font-weight: 800;\n    }\n    \n    .design2 .highlight {\n        color: #ff6b6b;\n        font-weight: 900;\n    }\n    \n    .design2 .description {\n        color: #7f8c8d;\n        font-size: 15px;\n        line-height: 1.5;\n        margin-bottom: 20px;\n    }\n    \n    .design2 .rating-text {\n        color: #6c757d;\n        font-size: 13px;\n        margin-top: 5px;\n    }\n    \n    .design2 .pricing-section {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 15px;\n        margin: 25px 0;\n    }\n    \n    .design2 .price-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin: 8px 0;\n    }\n    \n    .design2 .price-label {\n        font-size: 14px;\n        color: #6c757d;\n    }\n    \n    .design2 .price-value {\n        font-weight: 600;\n        font-size: 16px;\n    }\n    \n    .design2 .price-current {\n        color: #28a745;\n        font-size: 20px;\n        font-weight: 800;\n    }\n    \n    .design2 .price-old {\n        color: #dc3545;\n        text-decoration: line-through;\n    }\n    \n    .design2 .upgrade-btn {\n        background: linear-gradient(45deg, #ff6b6b, #ff8e53);\n        color: white;\n        border: none;\n        padding: 18px 35px;\n        border-radius: 12px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,107,107,0.3);\n    }\n    \n    .design2 .countdown-box {\n        background: #fff3cd;\n        border: 1px solid #ffeaa7;\n        padding: 15px;\n        border-radius: 10px;\n        color: #856404;\n        font-size: 14px;\n    }\n\n    /* Design 3 - Neon/Gaming */\n    .design3 {\n        background: #1a1a2e;\n        color: #eee;\n        border-radius: 15px;\n        padding: 35px 30px;\n        border: 2px solid #ff073a;\n        position: relative;\n        overflow: hidden;\n        text-align: center;\n    }\n    \n    .design3::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background: linear-gradient(45deg, rgba(255,7,58,0.1), rgba(0,245,255,0.1));\n    }\n    \n    .design3 .content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design3 .x-icon {\n        width: 75px;\n        height: 75px;\n        background: #ff073a;\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 30px;\n        font-weight: bold;\n        box-shadow: 0 0 25px rgba(255,7,58,0.6);\n    }\n    \n    .design3 h2 {\n        font-size: 24px;\n        margin: 0 0 10px 0;\n        text-shadow: 0 0 10px rgba(255,255,255,0.3);\n    }\n    \n    .design3 .neon-text {\n        color: #00f5ff;\n        text-shadow: 0 0 15px rgba(0,245,255,0.8);\n        font-weight: 900;\n    }\n    \n    .design3 .cyber-pricing {\n        background: rgba(0,245,255,0.1);\n        border: 1px solid rgba(0,245,255,0.3);\n        padding: 20px;\n        border-radius: 10px;\n        margin: 25px 0;\n    }\n    \n    .design3 .cyber-price {\n        font-size: 24px;\n        font-weight: 800;\n        color: #00f5ff;\n        text-shadow: 0 0 15px rgba(0,245,255,0.6);\n    }\n    \n    .design3 .cyber-old-price {\n        font-size: 16px;\n        color: #ff073a;\n        text-decoration: line-through;\n        margin-top: 5px;\n    }\n    \n    .design3 .game-button {\n        background: linear-gradient(45deg, #ff073a, #ff6b6b);\n        color: white;\n        border: none;\n        padding: 16px 30px;\n        border-radius: 8px;\n        font-size: 15px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        text-transform: uppercase;\n        letter-spacing: 1px;\n        box-shadow: 0 0 25px rgba(255,7,58,0.5);\n    }\n    \n    .design3 .neon-timer {\n        border: 1px solid rgba(255,193,7,0.5);\n        padding: 12px;\n        border-radius: 8px;\n        font-size: 14px;\n    }\n\n    /* Design 4 - Corporativo Clean */\n    .design4 {\n        background: white;\n        border-radius: 12px;\n        padding: 35px 30px;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n        border-top: 4px solid #e74c3c;\n        text-align: center;\n    }\n    \n    .design4 .alert-badge {\n        background: #e74c3c;\n        color: white;\n        padding: 8px 16px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 600;\n        display: inline-block;\n        margin-bottom: 20px;\n        text-transform: uppercase;\n    }\n    \n    .design4 h2 {\n        color: #2c3e50;\n        font-size: 22px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n    }\n    \n    .design4 .metric {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n        border-left: 4px solid #e74c3c;\n        text-align: left;\n    }\n    \n    .design4 .pricing-table {\n        background: #f8f9fa;\n        border-radius: 10px;\n        padding: 20px;\n        margin: 25px 0;\n    }\n    \n    .design4 .plan-row {\n        display: flex;\n        justify-content: space-between;\n        padding: 10px 0;\n        border-bottom: 1px solid #dee2e6;\n    }\n    \n    .design4 .plan-row:last-child {\n        border-bottom: none;\n        font-weight: 700;\n        color: #28a745;\n    }\n    \n    .design4 .pro-button {\n        background: #2c3e50;\n        color: white;\n        border: none;\n        padding: 16px 32px;\n        border-radius: 6px;\n        font-size: 15px;\n        font-weight: 500;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n    }\n\n    /* Design 5 - Cartoon/Friendly */\n    .design5 {\n        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);\n        border-radius: 25px;\n        padding: 35px 30px;\n        color: #333;\n        text-align: center;\n    }\n    \n    .design5 .sad-face {\n        width: 80px;\n        height: 80px;\n        background: #ff6b6b;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 35px;\n        color: white;\n    }\n    \n    .design5 h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .design5 .bubble {\n        background: rgba(255,255,255,0.9);\n        padding: 20px;\n        border-radius: 20px;\n        margin: 20px 0;\n        position: relative;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n    }\n    \n    .design5 .bubble::before {\n        content: '';\n        position: absolute;\n        bottom: -10px;\n        left: 30px;\n        width: 0;\n        height: 0;\n        border-left: 10px solid transparent;\n        border-right: 10px solid transparent;\n        border-top: 10px solid rgba(255,255,255,0.9);\n    }\n    \n    .design5 .happy-pricing {\n        background: rgba(255,255,255,0.8);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design5 .price-big {\n        font-size: 26px;\n        font-weight: 800;\n        color: #e74c3c;\n    }\n    \n    .design5 .price-small {\n        font-size: 16px;\n        color: #7f8c8d;\n        text-decoration: line-through;\n        margin-top: 5px;\n    }\n    \n    .design5 .fun-button {\n        background: #ff6b6b;\n        color: white;\n        border: none;\n        padding: 18px 35px;\n        border-radius: 25px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,107,107,0.3);\n    }\n\n    /* Design 6 - Material Design */\n    .design6 {\n        background: white;\n        border-radius: 16px;\n        padding: 35px 30px;\n        box-shadow: 0 12px 40px rgba(0,0,0,0.15);\n        position: relative;\n        text-align: center;\n    }\n    \n    .design6::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        height: 4px;\n        background: linear-gradient(90deg, #f44336, #ff9800);\n        border-radius: 16px 16px 0 0;\n    }\n    \n    .design6 .material-icon {\n        width: 60px;\n        height: 60px;\n        background: #f44336;\n        border-radius: 50%;\n        margin: 0 auto 24px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 24px;\n        box-shadow: 0 8px 25px rgba(244,67,54,0.3);\n    }\n    \n    .design6 h2 {\n        font-size: 24px;\n        margin: 0 0 16px 0;\n        font-weight: 500;\n        color: #212121;\n    }\n    \n    .design6 .card {\n        background: #f5f5f5;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 16px 0;\n        text-align: left;\n    }\n    \n    .design6 .material-pricing {\n        background: #e3f2fd;\n        border-left: 4px solid #2196f3;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n    }\n    \n    .design6 .price-material {\n        font-size: 22px;\n        font-weight: 600;\n        color: #1976d2;\n    }\n    \n    .design6 .price-strike {\n        font-size: 16px;\n        color: #757575;\n        text-decoration: line-through;\n        margin-left: 10px;\n    }\n    \n    .design6 .material-button {\n        background: #f44336;\n        color: white;\n        border: none;\n        padding: 16px 32px;\n        border-radius: 4px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        width: 100%;\n        margin: 16px 0 10px 0;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        box-shadow: 0 4px 12px rgba(244,67,54,0.3);\n    }\n\n    /* Design 7 - Glassmorphism */\n    .design7 {\n        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));\n        backdrop-filter: blur(20px);\n        border: 1px solid rgba(255,255,255,0.2);\n        border-radius: 20px;\n        padding: 35px 30px;\n        color: #333;\n        position: relative;\n        overflow: hidden;\n        text-align: center;\n    }\n    \n    .design7::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n        opacity: 0.1;\n    }\n    \n    .design7 .glass-content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design7 .glass-icon {\n        width: 75px;\n        height: 75px;\n        background: rgba(255,107,107,0.2);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,107,107,0.3);\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: #ff6b6b;\n        font-size: 28px;\n    }\n    \n    .design7 h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n        color: #1a1a1a;\n    }\n    \n    .design7 .glass-card {\n        background: rgba(255,255,255,0.1);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,255,255,0.2);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design7 .glass-pricing {\n        background: rgba(255,255,255,0.2);\n        backdrop-filter: blur(15px);\n        border: 1px solid rgba(255,255,255,0.3);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design7 .glass-price {\n        font-size: 24px;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .design7 .glass-old-price {\n        font-size: 16px;\n        color: #7f8c8d;\n        text-decoration: line-through;\n        margin-top: 8px;\n    }\n    \n    .design7 .glass-button {\n        background: rgba(255,107,107,0.2);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,107,107,0.3);\n        color: #ff6b6b;\n        padding: 16px 32px;\n        border-radius: 15px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n    }\n\n    /* Success Design */\n    .success-simple {\n        background: white;\n        border-radius: 20px;\n        padding: 40px 30px;\n        text-align: center;\n        box-shadow: 0 10px 30px rgba(0,0,0,0.1);\n    }\n    \n    .success-circle {\n        width: 80px;\n        height: 80px;\n        background: #28a745;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 35px;\n        box-shadow: 0 8px 25px rgba(40,167,69,0.3);\n        animation: successPulse 0.6s ease-out;\n    }\n    \n    .success-simple h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .success-simple .description {\n        color: #7f8c8d;\n        font-size: 16px;\n        line-height: 1.5;\n        margin-bottom: 20px;\n    }\n\n    /* Success Pro Design */\n    .success-pro-design4 {\n        background: white;\n        border-radius: 12px;\n        padding: 35px 30px;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n        border-top: 4px solid #28a745;\n        text-align: center;\n    }\n    \n    .success-badge {\n        background: #28a745;\n        color: white;\n        padding: 8px 16px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 600;\n        display: inline-block;\n        margin-bottom: 20px;\n        text-transform: uppercase;\n    }\n    \n    .success-pro-design4 h2 {\n        color: #2c3e50;\n        font-size: 22px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n    }\n    \n    .success-metric {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n        border-left: 4px solid #28a745;\n        text-align: left;\n        color: #2c3e50;\n        font-size: 14px;\n        line-height: 1.6;\n    }\n    \n    .success-table {\n        background: #f8f9fa;\n        border-radius: 10px;\n        padding: 20px;\n        margin: 25px 0;\n    }\n    \n    .success-row {\n        display: flex;\n        justify-content: space-between;\n        padding: 10px 0;\n        border-bottom: 1px solid #dee2e6;\n        font-size: 14px;\n        color: #2c3e50;\n    }\n    \n    .success-row:last-child {\n        border-bottom: none;\n        font-weight: 700;\n    }\n    \n    .success-row span:first-child {\n        color: #6c757d;\n    }\n    \n    .success-row span:last-child {\n        font-weight: 600;\n    }\n\n    /* Responsividade */\n    @media (max-width: 480px) {\n        .sharing-modal {\n            padding: 20px;\n            margin: 10px;\n        }\n        \n        .modal-title {\n            font-size: 20px;\n        }\n        \n        .modal-buttons {\n            flex-direction: column;\n        }\n    }\n</style>";
                                                            if (i) {
                                                                const b = `\n<div class="modal-container">\n    <div class="success-pro-design4">\n        <div class="success-badge">✓ ${c("pro_badge")}</div>\n        <h2>${c("sucesso_completo")}</h2>\n        \n        <div class="success-metric">\n            <strong>${c("alcance_total")}:</strong> ${p} contatos<br>\n            <strong>Status:</strong> ${c("todos_contatos_alcancados")}<br>\n            <strong>Limitações:</strong> ${c("sem_limitacoes")}\n        </div>\n        \n        <div class="success-table">\n            <div class="success-row">\n                <span>Plano Atual</span>\n                <span>Status Pro ✓</span>\n            </div>\n            <div class="success-row">\n                <span>Contatos Alcançados</span>\n                <span>${p}</span>\n            </div>\n            <div class="success-row">\n                <span>Taxa de Entrega</span>\n                <span style="color: #28a745; font-weight: 700;">100%</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <div style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 15px;">\n            Todos os seus contatos receberam seu status com sucesso!\n        </div>\n    </div>\n</div>`;
                                                                await n("view", 8, {
                                                                    totalContacts: l,
                                                                    lostContacts: 0,
                                                                    isProSubscriber: i,
                                                                    isBrazil: d,
                                                                    userCountryCode: u,
                                                                    paymentLink: ""
                                                                }), $("#sendModalBackdrop").remove(), Swal.fire({
                                                                    title: "",
                                                                    html: m + b,
                                                                    showConfirmButton: !1,
                                                                    confirmButtonText: c("confirmar"),
                                                                    buttonsStyling: !1,
                                                                    customClass: {
                                                                        popup: "swal-custom-popup"
                                                                    }
                                                                })
                                                            } else if (true) {
                                                                const y = `\n                <div class="modal-container">\n                    <div class="success-simple">\n                        <div class="success-circle">✓</div>\n                        <h2>${c("status_enviado_sucesso")}</h2>\n                        <p class="description">${c("status_enviado_pro",p)}</p>\n                        \n                        <div class="stars">\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                        </div>\n                    </div>\n                </div>`;
                                                                await n("view", 8, {
                                                                    totalContacts: l,
                                                                    lostContacts: 0,
                                                                    isProSubscriber: i,
                                                                    isBrazil: d,
                                                                    userCountryCode: u,
                                                                    paymentLink: ""
                                                                }), $("#sendModalBackdrop").remove(), Swal.fire({
                                                                    title: "",
                                                                    html: m + y,
                                                                    showConfirmButton: !1,
                                                                    confirmButtonText: c("confirmar"),
                                                                    buttonsStyling: !1,
                                                                    customClass: {
                                                                        popup: "swal-custom-popup"
                                                                    }
                                                                })
                                                            } else {
                                                                const A = 3,
                                                                    E = t(),
                                                                    S = Date.now(),
                                                                    w = (d ? "https://buy.stripe.com/cNi28s7zDdeF10A9t97EQ0r" : "https://buy.stripe.com/14A28scTXdeFfVubBh7EQ0s") + `?client_reference_id=${E}_${A}_${S}_${u}`;
                                                                await n("view", A, {
                                                                    totalContacts: l,
                                                                    lostContacts: g,
                                                                    isProSubscriber: i,
                                                                    isBrazil: d,
                                                                    userCountryCode: u,
                                                                    paymentLink: w
                                                                }), window.statusProShareCount = 0, window.statusProTargetShares = 15, window.statusProCurrentDesign = A, window.statusProPaymentLink = w, window.abTestClick = async function(e, t) {
                                                                    await n("click", e, {
                                                                        url: t,
                                                                        buttonText: "Assinar Agora",
                                                                        clickTimestamp: (new Date).toISOString(),
                                                                        clickType: "main_cta",
                                                                        userCountryCode: u
                                                                    }), window.open(t, "_blank")
                                                                }, window.openSharingModal = async function() {
                                                                    const e = `\n                        <div class="sharing-modal-overlay" id="sharingModal">\n                            <div class="sharing-modal">\n                                <button class="close-button" onclick="closeSharingModal()">×</button>\n                                \n                                <div class="modal-header">\n                                    <div class="discount-badge">30% OFF</div>\n                                    <h2 class="modal-title">${c("titulo_modal_desconto")}</h2>\n                                    <p class="modal-subtitle">\n                                        ${c("subtitulo_modal_desconto")}\n                                    </p>\n                                </div>\n\n                                <div class="sharing-steps">\n                                    <div class="step">\n                                        <div class="step-number">1</div>\n                                        <div class="step-content">\n                                            <div class="step-title">${c("passo2_titulo")}</div>\n                                            <div class="step-description">${c("passo2_descricao")}</div>\n                                        </div>\n                                    </div>\n                                    <div class="step">\n                                        <div class="step-number">2</div>\n                                        <div class="step-content">\n                                            <div class="step-title">${c("passo3_titulo")}</div>\n                                            <div class="step-description">${c("passo3_descricao")}</div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="counter-section">\n                                    <div class="counter-title">${c("progresso_compartilhamento")}</div>\n                                    <div class="progress-bar">\n                                        <div class="progress-fill" id="progressFill"></div>\n                                    </div>\n                                    <div class="counter-display">\n                                        <span id="shareCounter">0</span>/15\n                                    </div>\n                                    <div class="counter-text">${c("contatos_compartilhados")}</div>\n                                </div>\n\n                                <div class="modal-buttons">\n                                    <button class="btn-secondary" onclick="closeSharingModal()">${c("cancelar")}</button>\n                                    <button class="btn-primary" id="startSharingBtn" onclick="startSharing()">\n                                        ${c("comecar_compartilhar")}\n                                    </button>\n                                </div>\n                            </div>\n                        </div>`,
                                                                        t = document.createElement("div");
                                                                    t.innerHTML = e, document.body.appendChild(t.firstElementChild), setTimeout((() => {
                                                                        document.getElementById("sharingModal").classList.add("active"), document.body.style.overflow = "hidden"
                                                                    }), 100)
                                                                }, window.closeSharingModal = async function() {
                                                                    const e = document.getElementById("sharingModal");
                                                                    e && (e.classList.remove("active"), document.body.style.overflow = "auto", setTimeout((() => {
                                                                        e.remove()
                                                                    }), 300))
                                                                }, window.startSharing = async function() {
                                                                    const e = function(e) {
                                                                            const t = (navigator.language || navigator.userLanguage).toLowerCase();
                                                                            return t.startsWith("pt") ? "{Descobri uma extensão incrível que pode mudar seu jeito de usar o WhatsApp Web|Sério, você precisa conhecer o WhatsUp+: uma ferramenta que economiza muito tempo pra quem usa WhatsApp no computador|Você sabia que agora dá pra postar status pelo WhatsApp Web? Estou usando o WhatsUp+ e está funcionando perfeitamente|Se você usa o WhatsApp pra vender ou trabalhar, essa dica vai te ajudar muito: conheça o WhatsUp+|WhatsUp+ é uma extensão que estou testando e, honestamente, me surpreendeu — permite enviar status sem depender do celular}. {Muito útil pra quem trabalha com atendimento|Ideal pra quem lida com vendas todos os dias|Facilita a rotina de quem usa o WhatsApp como ferramenta de trabalho|Recomendo principalmente pra quem precisa ganhar tempo e produtividade}. {Vale a pena testar|Fica a dica|Dá uma olhada, é bem leve e simples de usar}. 🔗 https://wup.plus" : t.startsWith("es") ? "{Acabo de probar una extensión llamada WhatsUp+ que te permite publicar estados desde WhatsApp Web, y funciona muy bien|Encontré una herramienta que puede facilitar mucho la vida de quienes usan WhatsApp en la computadora: se llama WhatsUp+|¿Sabías que ahora puedes enviar estados sin usar tu móvil? Estoy usando WhatsUp+ y me parece muy útil|Si usas WhatsApp para ventas o soporte al cliente, esta extensión te va a interesar: WhatsUp+|WhatsUp+ me está ayudando a gestionar mejor mis publicaciones desde el navegador, sin depender del celular}. {Ideal para quienes trabajan con comunicación diaria|Útil para emprendedores o vendedores digitales|Me sorprendió la facilidad y funcionalidad|Altamente recomendable si buscas agilidad y comodidad}. {Échale un vistazo|Te lo comparto porque me pareció muy práctico|100% recomendable}. 🔗 https://wup.plus" : t.startsWith("fr") ? "{J’ai découvert une extension géniale pour WhatsApp Web : WhatsUp+. Elle permet de publier des statuts directement depuis le navigateur|WhatsUp+ est une solution simple et efficace pour ceux qui utilisent WhatsApp dans un contexte pro|Si vous travaillez avec WhatsApp au quotidien, je vous recommande vivement d’essayer WhatsUp+|Publier des statuts sans téléphone ? Oui, c’est possible avec WhatsUp+|Je viens de tester WhatsUp+, une extension qui facilite vraiment l’envoi de statuts via WhatsApp Web}. {Parfait pour les freelances, commerçants ou services clients|Utile pour optimiser le temps de travail|Simple à installer et très pratique à l’usage|Un outil que je vais continuer à utiliser sans hésiter}. {Faites un essai|Regardez par vous-même|Un vrai gain de temps}. 🔗 https://wup.plus" : "{I found a browser extension called WhatsUp+ that lets you post WhatsApp status directly from your computer — no phone needed|Just tried WhatsUp+, a brilliant tool for anyone using WhatsApp Web regularly|If you're using WhatsApp for business or customer support, you should check out WhatsUp+|WhatsUp+ helped me streamline my work — posting statuses without needing my phone is a game-changer|This is for those who want to post WhatsApp statuses straight from their browser: try WhatsUp+}. {Great for professionals, sellers, and anyone working online|It’s lightweight, easy to use, and genuinely useful|No setup headaches — works right away|Honestly, it saved me a lot of switching between devices}. {Worth trying|Check it out if you rely on WhatsApp|Highly recommend it}. 🔗 https://wup.plus"
                                                                        }(),
                                                                        t = document.getElementById("startSharingBtn");

                                                                    function n(e) {
                                                                        return e.map((e => ({
                                                                            value: e,
                                                                            sort: Math.random()
                                                                        }))).sort(((e, t) => e.sort - t.sort)).map((({
                                                                            value: e
                                                                        }) => e))
                                                                    }
                                                                    t.textContent = c("compartilhando"), t.disabled = !0;
                                                                    let o = WUPE.wa.allContacts().filter((e => e.isAddressBookContact)).map((e => e.id._serialized));
                                                                    o = n(o);
                                                                    const s = new Set(o);
                                                                    if (s.size < 15) {
                                                                        const e = n(WUPE.wa.allChats().map((e => e.id._serialized)));
                                                                        for (const t of e)
                                                                            if (!s.has(t) && (s.add(t), s.size >= 15)) break
                                                                    }
                                                                    const a = Array.from(s).slice(0, 15);
                                                                    await simulateSharing(e, a)
                                                                }, window.simulateSharing = async function(e, t) {
                                                                    let o = 0,
                                                                        s = 0;
                                                                    const a = t.length;
                                                                    console.log(`Iniciando envio para ${a} contatos`);
                                                                    for (let n = 0; n < a; n++) {
                                                                        const i = t[n];
                                                                        if (i) {
                                                                            try {
                                                                                await WUPE.chat.shareador(i, (r = e, r.replace(/\{([^{}]+?)\}/g, ((e, t) => {
                                                                                    const n = t.split("|");
                                                                                    return n[Math.floor(Math.random() * n.length)]
                                                                                })))), o++, window.statusProShareCount++, console.log(`✓ Enviado com sucesso para contato ${n+1}/${a}`)
                                                                            } catch (e) {
                                                                                s++, console.warn(`✗ Erro ao enviar para contato ${n+1}/${a}:`, i, e)
                                                                            }
                                                                            updateProgress()
                                                                        } else console.warn(`Contato ${n} é inválido, pulando...`)
                                                                    }
                                                                    var r;
                                                                    console.log(`Compartilhamento finalizado: ${o} sucessos, ${s} falhas de ${a} total`), await n("sharing_completed", window.statusProCurrentDesign, {
                                                                        totalContacts: a,
                                                                        userCountryCode: u
                                                                    }), setTimeout((() => {
                                                                        closeSharingModal(), showSuccessModal()
                                                                    }), 500)
                                                                }, window.updateProgress = function() {
                                                                    const e = window.statusProShareCount / window.statusProTargetShares * 100,
                                                                        t = document.getElementById("progressFill"),
                                                                        n = document.getElementById("shareCounter");
                                                                    if (t && (t.style.width = e + "%"), n && (n.textContent = window.statusProShareCount), window.statusProShareCount >= window.statusProTargetShares) {
                                                                        const e = document.querySelector(".counter-section");
                                                                        e && (e.style.background = "#d4edda", e.style.borderColor = "#c3e6cb")
                                                                    }
                                                                }, window.showSuccessModal = async function() {
                                                                    const e = "30OFF",
                                                                        t = `\n                        <div class="sharing-modal-overlay" id="successModal">\n                            <div class="sharing-modal">\n                                <button class="close-button" onclick="closeSuccessModal()">×</button>\n                                \n                                <div class="success-animation">\n                                    <div class="success-icon">🎉</div>\n                                    <h2 class="modal-title">${c("parabens")}</h2>\n                                    <p class="modal-subtitle">\n                                        ${c("sucesso_compartilhamento")}\n                                    </p>\n                                    \n                                    <div class="coupon-code">\n                                        ${e}\n                                        <button class="copy-button" onclick="copyCoupon('${e}')">${c("copiar")}</button>\n                                    </div>\n                                    \n                                    <p style="color: #6c757d; font-size: 14px; margin: 15px 0;">\n                                        ${c("usar_cupom")}\n                                    </p>\n                                    \n                                    <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="proceedToCheckout('${e}')">\n                                        ${c("finalizar_compra_desconto")}\n                                    </button>\n                                </div>\n                            </div>\n                        </div>`,
                                                                        n = document.createElement("div");
                                                                    n.innerHTML = t, document.body.appendChild(n.firstElementChild), setTimeout((() => {
                                                                        document.getElementById("successModal").classList.add("active")
                                                                    }), 100)
                                                                }, window.closeSuccessModal = function() {
                                                                    const e = document.getElementById("successModal");
                                                                    e && (e.classList.remove("active"), setTimeout((() => {
                                                                        e.remove();
                                                                        const t = document.querySelector("style[data-statuspro-styles]");
                                                                        t && t.remove()
                                                                    }), 300))
                                                                }, window.copyCoupon = async function(e) {
                                                                    try {
                                                                        await navigator.clipboard.writeText(e);
                                                                        const t = x.target,
                                                                            n = t.textContent;
                                                                        t.textContent = c("copiado"), t.style.background = "#28a745", setTimeout((() => {
                                                                            t.textContent = n, t.style.background = "#007bff"
                                                                        }), 2e3)
                                                                    } catch (e) {
                                                                        console.error("Erro ao copiar cupom:", e)
                                                                    }
                                                                }, window.proceedToCheckout = async function(e) {
                                                                    const t = window.statusProPaymentLink + `&coupon=${e}`;
                                                                    window.open(t, "_blank"), closeSuccessModal()
                                                                }, window.getABTestBackupData = function() {
                                                                    return JSON.parse(localStorage.getItem(r) || "[]")
                                                                }, window.clearABTestBackup = function() {
                                                                    localStorage.removeItem(r), console.log("Backup local limpo!")
                                                                };
                                                                const v = m + {
                                                                    1: `\n<div class="modal-container">\n    <div class="design1">\n        <div class="content">\n            <div class="error-icon">✖</div>\n            <h2><span class="highlight">${h}</span> ${c("usuarios_nao_viram_status")}</h2>\n            <p class="subtitle">${c("motivo_perda")}</p>\n            \n            <div class="stats">\n                ${c("limite_gratuito","50")}. ${c("limitacao_vendas")}\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <div class="pricing">\n                <div class="current-price">${c("preco_assinatura")}</div>\n                <div class="old-price">${d?"R$ 59,99":"$35.99"}</div>\n            </div>\n            \n            <button class="cta-button" onclick="window.abTestClick(${A}, '${w}')">\n                ${c("assine_agora")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${c("botao_desconto")}\n            </button>\n            \n            <div class="timer">\n                <span>⏰ ${c("oferta_expira")}</span>\n                <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`,
                                                                    2: `\n<div class="modal-container">\n    <div class="design2">\n        <div class="warning-circle">✖</div>\n        <h2><span class="highlight">${h}</span> ${c("usuarios_nao_viram_status")}</h2>\n        <p class="description">${c("limite_gratuito","50")}. ${c("limitacao_vendas")}</p>\n        \n        <div class="pricing-section">\n            <div class="price-row">\n                <span class="price-label">${c("plano_gratuito")}:</span>\n                <span class="price-value">50 ${c("contatos")}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">Status Pro:</span>\n                <span class="price-value">${c("contatos_ilimitados")}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">${c("preco_normal")}:</span>\n                <span class="price-value price-old">${d?"R$ 59,99":"$35.99"}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">${c("oferta_especial")}:</span>\n                <span class="price-value price-current">${d?"R$ 29,99/mês":"$17.99/mês"}</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        <div class="rating-text">${c("usuarios_satisfeitos")}</div>\n        \n        <button class="upgrade-btn" onclick="window.abTestClick(${A}, '${w}')">\n            ${c("assine_agora")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${c("botao_desconto")}\n        </button>\n        \n        <div class="countdown-box">\n            ⏰ ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
                                                                    3: `\n<div class="modal-container">\n    <div class="design3">\n        <div class="content">\n            <div class="x-icon">✖</div>\n            <h2><span class="neon-text">${h}</span> ${c("usuarios_nao_viram_status")}</h2>\n            <p>${c("motivo_perda")}</p>\n            \n            <p>${c("limite_gratuito","50")}</p>\n            \n            <div class="cyber-pricing">\n                <div class="cyber-price">${d?"R$ 29,99/mês":"$17.99/mês"}</div>\n                <div class="cyber-old-price">${c("era")} ${d?"R$ 59,99":"$35.99"}</div>\n                <div style="color: #00f5ff; font-size: 14px; margin-top: 8px;">💀 ${c("desconto_limitado")}</div>\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <button class="game-button" onclick="window.abTestClick(${A}, '${w}')">\n                ${c("unlock_all_contacts")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${c("botao_desconto")}\n            </button>\n            \n            <div class="neon-timer">\n                ⚡ ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`,
                                                                    4: `\n<div class="modal-container">\n    <div class="design4">\n        <div class="alert-badge">⚠ ${c("alcance_limitado")}</div>\n        <h2><span class="highlight">${h}</span> ${c("usuarios_nao_viram_status")} ${c("por_nao_ter_pro")}</h2>\n        \n        <div class="metric">\n            <strong>${c("status_enviado")}:</strong> 50 ${c("de")} ${p} ${c("contatos")}<br>\n            <strong>${c("perda")}:</strong> ${h} ${c("usuarios_nao_receberam")}<br>\n            <strong>${c("impacto")}:</strong> ${c("entrega_limitada")}\n        </div>\n        \n        <div class="pricing-table">\n            <div class="plan-row">\n                <span>${c("plano_gratuito")}</span>\n                <span>50 ${c("contatos")}</span>\n            </div>\n            <div class="plan-row">\n                <span>Status Pro</span>\n                <span>${c("ilimitado")}</span>\n            </div>\n            <div class="plan-row">\n                <span>${c("preco_promocional")}</span>\n                <span>${d?"R$ 29,99/mês":"$17.99/mês"}</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="pro-button" onclick="window.abTestClick(${A}, '${w}')">\n            ${c("upgrade_para_pro")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${c("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center; color: #7f8c8d;">\n            ⏱ ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
                                                                    5: `\n<div class="modal-container">\n    <div class="design5">\n        <div class="sad-face">😢</div>\n        <h2>${c("ops")} <span class="highlight">${h}</span> ${c("usuarios_nao_viram_status")}</h2>\n        \n        <div class="bubble">\n            <p>${c("limite_gratuito","50")}. ${c("que_tal_alcancar_todos")}</p>\n        </div>\n        \n        <div class="happy-pricing">\n            <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 10px;">💝 ${c("oferta_especial")}</div>\n            <div class="price-big">${d?"R$ 29,99/mês":"$17.99/mês"}</div>\n            <div class="price-small">${c("de")} ${d?"R$ 59,99":"$35.99"} ${c("por_apenas")}</div>\n            <div style="color: #28a745; font-weight: 600; margin-top: 8px;">✨ ${c("economize_50")}</div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="fun-button" onclick="window.abTestClick(${A}, '${w}')">\n            ${c("liberar_para_todos")} 🚀\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${c("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center;">\n            ⏰ ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
                                                                    6: `\n<div class="modal-container">\n    <div class="design6">\n        <div class="material-icon">⚠</div>\n        <h2>${c("alcance_limitado_detectado")}</h2>\n        \n        <div class="card">\n            <p><strong>${c("contatos_alcancados")}:</strong> 50 ${c("de")} ${p}</p>\n            <p><strong>${c("usuarios_perdidos")}:</strong> ${h}</p>\n            <p><strong>${c("impacto_na_entrega")}:</strong> ${c("alto")}</p>\n        </div>\n        \n        <div class="material-pricing">\n            <div style="font-size: 14px; color: #1976d2; margin-bottom: 8px;">${c("oferta_limitada")}</div>\n            <div class="price-material">${d?"R$ 29,99/mês":"$17.99/mês"}</div>\n            <div class="price-strike">${d?"R$ 59,99":"$35.99"}</div>\n            <div style="color: #4caf50; font-size: 12px; margin-top: 8px; font-weight: 500;">\n                💰 ${c("economize_50")} • 🛡️ ${c("garantia_7_dias")}\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="material-button" onclick="window.abTestClick(${A}, '${w}')">\n            ${c("expandir_alcance")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${c("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center; color: #757575;">\n            ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
                                                                    7: `\n<div class="modal-container">\n    <div class="design7">\n        <div class="glass-content">\n            <div class="glass-icon">✖</div>\n            <h2><span class="highlight">${h}</span> ${c("usuarios_nao_viram_status")}</h2>\n            \n            <div class="glass-card">\n                <p>${c("limite_gratuito","500")}. ${c("limitacao_vendas")}</p>\n            </div>\n            \n            <div class="glass-pricing">\n                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 8px;">🔥 ${c("promocao_especial")}</div>\n                <div class="glass-price">${d?"R$ 29,99/mês":"$17.99/mês"}</div>\n                <div class="glass-old-price">${c("era")} ${d?"R$ 59,99/mês":"$35.99/mês"}</div>\n                <div style="color: #28a745; font-size: 14px; font-weight: 600; margin-top: 10px;">\n                    ⚡ ${c("desconto_50")} • ✅ ${c("mais_10k_usuarios")}\n                </div>\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <button class="glass-button" onclick="window.abTestClick(${A}, '${w}')">\n                ${c("assine_agora")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${c("botao_desconto")}\n            </button>\n            \n            <div style="text-align: center;">\n                ⏰ ${c("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`
                                                                } [A];
                                                                $("#sendModalBackdrop").remove(), Swal.fire({
                                                                    title: "",
                                                                    html: v,
                                                                    showConfirmButton: !1,
                                                                    buttonsStyling: !1,
                                                                    customClass: {
                                                                        popup: "swal-custom-popup"
                                                                    },
                                                                    onOpen: () => {
                                                                        window.swalStartTime = Date.now();
                                                                        const e = document.getElementById("countdown");
                                                                        if (e) {
                                                                            let t = 4,
                                                                                n = 59;
                                                                            const o = setInterval((() => {
                                                                                if (0 === n) {
                                                                                    if (0 === t) return clearInterval(o), void(e.textContent = "00:00");
                                                                                    t--, n = 59
                                                                                } else n--;
                                                                                const s = `${t.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`;
                                                                                e.textContent = s
                                                                            }), 1e3)
                                                                        }
                                                                        document.addEventListener("keydown", (e => {
                                                                            if ("Escape" === e.key) {
                                                                                const e = document.getElementById("sharingModal"),
                                                                                    t = document.getElementById("successModal");
                                                                                e && e.classList.contains("active") ? window.closeSharingModal() : t && t.classList.contains("active") && window.closeSuccessModal()
                                                                            }
                                                                        })), document.addEventListener("click", (e => {
                                                                            e.target.classList.contains("sharing-modal-overlay") && ("sharingModal" === e.target.id ? window.closeSharingModal() : "successModal" === e.target.id && window.closeSuccessModal())
                                                                        }))
                                                                    },
                                                                    onClose: () => {
                                                                        const e = Date.now() - window.swalStartTime;
                                                                        n("time_spent", A, {
                                                                            timeSpentMs: e,
                                                                            timeSpentSeconds: Math.round(e / 1e3),
                                                                            userCountryCode: u
                                                                        });
                                                                        const t = document.querySelector("style[data-statuspro-styles]");
                                                                        t && t.remove()
                                                                    }
                                                                })
                                                            }
                                                            const W = document.createElement("style");
                                                            W.setAttribute("data-statuspro-styles", "true"), W.innerHTML = "\n                .swal-custom-popup {\n                    padding: 0 !important;\n                    border-radius: 20px !important;\n                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;\n                    overflow: hidden !important;\n                    background: transparent !important;\n                }\n                .swal2-title {\n                    display: none !important;\n                }\n                .swal2-icon {\n                    display: none !important;\n                }\n                .swal2-container {\n                    backdrop-filter: blur(5px) !important;\n                    background: rgba(0, 0, 0, 0.7) !important;\n                }\n            ", document.head.appendChild(W)
                                                        }
                                                    } catch (C) {
                                                        console.log("Failed to show completion:", C)
                                                    }
                                                }(y)
                                            }), 1e3)
                                        }
                                    })), l.apply(this, arguments)
                                }

                                function d(e, t, n, o, s) {
                                    return u.apply(this, arguments)
                                }

                                function u() {
                                    return u = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s, a) {
                                        var r, i = o("WAWebSendMsgCommonApi").encodeAndPad(a);
                                        a = o("WAWebBackendJobsCommon").mediaTypeFromProtobuf(a), i = (t = yield o("WAWebSignal").Cipher.encryptSenderKeyMsgSignalProto(e, t, i, !1)).ciphertext, t = t.senderKeyBytes, n.length > 0 && (r = yield o("WAWebGetGroupKeyDistributionMsg").getKeyDistributionMsg(null, e, n, t, !1)), e = [], n = [], t = !1;
                                        var c = null;
                                        return r && r.length > 0 && (e = r.map((function(e) {
                                            if (void 0 !== e) {
                                                var n = e.type,
                                                    s = e.ciphertext;
                                                return e = e.participant, n === o("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (t = !0), o("WAWap").wap("to", {
                                                    jid: o("WAWebCommsWapMd").DEVICE_JID(e)
                                                }, o("WAWap").wap("enc", {
                                                    v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                                    type: o("WAWap").CUSTOM_STRING(n)
                                                }, s))
                                            }
                                            return null
                                        }))), n = s.map((function(e) {
                                            return o("WAWap").wap("to", {
                                                jid: o("WAWebCommsWapMd").USER_JID(e)
                                            })
                                        })), (n.length > 0 || e.length > 0) && (c = o("WAWap").wap("participants", null, e.concat(n))), s = o("WAWap").wap("enc", {
                                            v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                            type: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobs.flow").CiphertextType.Skmsg),
                                            mediatype: o("WAWebBackendJobsCommon").encodeMaybeMediaType(a)
                                        }, i), e = null, t && (n = yield o("WAWebAdvSignatureApi").getADVEncodedIdentity(), e = o("WAWap").wap("device-identity", null, n)), [c, s, e]
                                    })), u.apply(this, arguments)
                                }

                                function p(e) {
                                    switch (e) {
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.AllowList:
                                            return "allowlist";
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.DenyList:
                                            return "denylist";
                                        case o("WAWebUserPrefsStatusType").StatusPrivacySettingType.Contact:
                                            return "contacts"
                                    }
                                }

                                function g(e, t, n, o) {
                                    return h.apply(this, arguments)
                                }

                                function h() {
                                    return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s) {
                                        var a = e.data.id,
                                            r = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID);
                                        o("WALogger").LOG(c(), a.id, n.length), t = (e = yield o("WAWebSendMsgCreateFanoutStanza").createFanoutMsgStanza(e, t, n, {
                                            fanoutType: o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT
                                        }, s)).stanza, yield o("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (n = s.sendPerfReporter) || n.startWrittenWireStage(), o("WALogger").LOG(i(), a.id), yield o("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(t, o("WAWebCommsAckParser").toCoreAckTemplate({
                                            id: a.id,
                                            class: "message",
                                            from: r,
                                            participant: null
                                        })), null == (e = s.sendPerfReporter) || e.postWrittenWireStage()
                                    })), h.apply(this, arguments)
                                }
                                r.encryptAndSendStatusMsg = function(e, t, n) {
                                    return l.apply(this, arguments)
                                }
                            }), 98), window.require("__debug").modulesMap.WAWebGetGroupKeyDistributionMsg = null, __d("WAWebGetGroupKeyDistributionMsg", ["Promise", "WALogger", "WAWebAdvMetadataCreationFailureWamEvent", "WAWebApiDeviceList", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebEncryptMsgProtobuf", "WAWebIdentityIcdcApi", "WAWebSendMsgCommonApi", "WAWebUserPrefsMeUser", "WAWebWidFactory", "asyncToGeneratorRuntime", "err"], (function(e, t, n, o, s, a, r) {
                                var i;

                                function c() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for ", ", ", ""]);
                                    return c = function() {
                                        return e
                                    }, e
                                }

                                function l() {
                                    var e = babelHelpers.taggedTemplateLiteralLoose(["getKeyDistributionMsg: precalculate ICDC for ", ""]);
                                    return l = function() {
                                        return e
                                    }, e
                                }

                                function d() {
                                    return d = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, s, a, r) {
                                        var d = {
                                            senderKeyDistributionMessage: {
                                                groupId: n.toString({
                                                    legacy: !0
                                                }),
                                                axolotlSenderKeyDistributionMessage: a
                                            }
                                        };
                                        o("WALogger").LOG(l(), null == e ? void 0 : e.id.toString()).tags("messaging");
                                        var p = yield u(d, s, r, n);
                                        return a = s.map(function() {
                                            var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                                try {
                                                    var t;
                                                    return t = null != (t = p.get(o("WAWebWidFactory").asUserWidOrThrow(e).toString())) ? t : babelHelpers.extends({}, d), {
                                                        type: (t = yield o("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(e, 0, t)).type,
                                                        ciphertext: t.ciphertext,
                                                        isUsingDeprecatedLidSession: t.isUsingDeprecatedLidSession,
                                                        participant: e
                                                    }
                                                } catch (t) {
                                                    return o("WALogger").LOG(c(), e.toString(), t).tags("messaging"), o("WAWebSendMsgCommonApi").isPrimaryDevice(e) && o("WALogger").WARN(c(), "Ignorando falha de criptografia para dispositivo primário: " + String(e)), null
                                                }
                                            }));
                                            return function(t) {
                                                return e.apply(this, arguments)
                                            }
                                        }()), (e = yield(i || (i = t("Promise"))).all(a)).filter(Boolean)
                                    })), d.apply(this, arguments)
                                }

                                function u(e, t, n, o) {
                                    return p.apply(this, arguments)
                                }

                                function p() {
                                    return p = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, s, a) {
                                        var r = o("WAWebUserPrefsMeUser").getMePnUserOrThrow(),
                                            c = [].concat(Array.from(new Set(n.map(o("WAWebWidFactory").asUserWidOrThrow)))),
                                            l = (n = yield o("WAWebApiDeviceList").bulkGetDeviceRecord([r].concat(c)))[0];
                                        n = n.slice(1);
                                        var d = null;
                                        try {
                                            d = yield o("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(r, l)
                                        } catch (e) {
                                            throw new(o("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
                                                advMetadataIsMe: !0
                                            }).commit(), e
                                        }
                                        var u = new Map;
                                        return yield(i || (i = t("Promise"))).all(n.map(function() {
                                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t, n) {
                                                n = c[n];
                                                var r = babelHelpers.extends({}, e),
                                                    i = null;
                                                if (o("WAWebUserPrefsMeUser").isMeAccount(n)) s && (r = o("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, a));
                                                else try {
                                                    i = yield o("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(n, t)
                                                } catch (e) {
                                                    throw new(o("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
                                                        advMetadataIsMe: !1
                                                    }).commit(), e
                                                }
                                                o("WAWebE2EProtoGenerator").populateMessageContextInfo(r, d, i), u.set(n.toString(), r)
                                            }));
                                            return function(e, t) {
                                                return n.apply(this, arguments)
                                            }
                                        }())), u
                                    })), p.apply(this, arguments)
                                }
                                r.getKeyDistributionMsg = function(e, t, n, o, s) {
                                    return d.apply(this, arguments)
                                }, r.generateMsgProtobufs = u
                            }), 98), window.require("__debug").modulesMap.WAWebSendStatusMsgAction = null, __d("WAWebSendStatusMsgAction", ["invariant", "WAJids", "WALogger", "WATimeUtils", "WAWebAck", "WAWebDBProcessMessage", "WAWebEncryptAndSendStatusMsg", "WAWebGenMinimalLinkPreviewChatAction", "WAWebLidStatusMigrationUtils", "WAWebMessageSendPerfReporter", "WAWebMessagingGatingUtils", "WAWebMsgKey", "WAWebMsgModel", "WAWebMsgType", "WAWebOutgoingMessage", "WAWebPostSendStatusFailure", "WAWebSendMsgMetricReporter", "WAWebSendMsgResultAction", "WAWebSendMsgTypes", "WAWebStatusCollection", "WAWebStatusGatingUtils", "WAWebUserPrefsMeUser", "WAWebViewMode.flow", "WAWebWamEnumMessageSendResultType", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, o, s, a, r, i) {
                                var c, l, d, u, p, g, h, m, W, f, b = 4286237861;

                                function y() {
                                    return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        var t;
                                        o("WALogger").LOG(c || (c = babelHelpers.taggedTemplateLiteralLoose(["sendStatusTextMsgAction: start to send text messege"]))), null != (e = yield w(e)) || i(0, 73062);
                                        var n = new(o("WAWebMsgModel").Msg)(e);
                                        n.wamMessageSendPerfReporter = new(o("WAWebMessageSendPerfReporter").MessageSendPerfReporter)({
                                            chatWid: n.to,
                                            mediaType: n.getWamMediaType(),
                                            messageType: n.getWamMessageType()
                                        });
                                        var s = o("WAWebSendMsgMetricReporter").createMsgModelMetricReporter(n);
                                        return s.sendReporter = null != (t = s.sendReporter) ? t : s.createSendReporter(), null == (t = s.sendPerfReporter) || t.startRenderedStage(), yield o("WAWebStatusCollection").StatusCollection.addStatusMessages(n.author, [n]), o("WAWebStatusCollection").StatusCollection.handleUpdate(e, null, !1), null == (t = s.sendPerfReporter) || t.postRenderedStage(), null == (t = s.sendPerfReporter) || t.startSavedStage(), yield o("WAWebDBProcessMessage").storeMessages([e], n.to), o("WALogger").LOG(l || (l = babelHelpers.taggedTemplateLiteralLoose(["sendStatusTextMsgAction: store text messege"]))), null == (t = s.sendPerfReporter) || t.postSavedStage(), E(n, e, s)
                                    })), y.apply(this, arguments)
                                }

                                function A() {
                                    return A = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t) {
                                        var s;
                                        o("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: start to send status messege"]))), e = babelHelpers.extends({}, e, {
                                            id: new(n("WAWebMsgKey"))({
                                                fromMe: e.id.fromMe,
                                                remote: e.id.remote,
                                                id: e.id.id,
                                                participant: e.id.participant ? o("WAWebLidStatusMigrationUtils").matWidConvert(e.id.participant) : void 0
                                            }),
                                            from: o("WAWebLidStatusMigrationUtils").matWidConvert(e.from),
                                            author: o("WAWebLidStatusMigrationUtils").matWidConvert(o("WAWebUserPrefsMeUser").getMePnUserOrThrow()),
                                            cannotBeRanked: o("WAWebStatusGatingUtils").canCheckStatusRankingPosterGating()
                                        });
                                        var a = new(o("WAWebMsgModel").Msg)(e);
                                        a.wamMessageSendPerfReporter = new(o("WAWebMessageSendPerfReporter").MessageSendPerfReporter)({
                                            chatWid: a.to,
                                            mediaType: a.getWamMediaType(),
                                            messageType: a.getWamMessageType()
                                        });
                                        var r = o("WAWebSendMsgMetricReporter").createMsgModelMetricReporter(a);
                                        r.sendReporter = null != (s = r.sendReporter) ? s : r.createSendReporter(), null == (s = r.sendPerfReporter) || s.startRenderedStage(), yield o("WAWebStatusCollection").StatusCollection.addStatusMessages(a.author, [a]), o("WAWebStatusCollection").StatusCollection.handleUpdate(e, null, !1), null == (s = r.sendPerfReporter) || s.postRenderedStage(), null == (s = r.sendPerfReporter) || s.startSavedStage(), yield o("WAWebDBProcessMessage").storeMessages([e], a.to), o("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: store media messege"]))), null == (s = r.sendPerfReporter) || s.postSavedStage(), null == (s = r.sendPerfReporter) || s.startReadyToSendStage(), yield a.waitForPrep();
                                        try {
                                            yield t(a)
                                        } catch (e) {
                                            return console.log(p || (p = babelHelpers.taggedTemplateLiteralLoose(["[status] failed to send status message with ", ""])), e).sendLogs("status-send-media-error"), null == (s = r.sendReporter) || s.postFailure({
                                                result: o("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_UPLOAD,
                                                isTerminal: !0
                                            }), {
                                                messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.ERROR_UPLOAD
                                            }
                                        }
                                        return null == (t = r.sendPerfReporter) || t.postReadyToSendStage(), o("WALogger").LOG(g || (g = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: media prep done for status messege"]))).devConsole(e), E(a, e, r)
                                    })), A.apply(this, arguments)
                                }

                                function E(e, t, n) {
                                    return S.apply(this, arguments)
                                }

                                function S() {
                                    return S = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
                                        o("WALogger").LOG(h || (h = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: send status messege ", ""])), e.id).devConsole(t), t = {
                                            type: o("WAWebSendMsgTypes").SendMessageRecordType.Message,
                                            data: e
                                        };
                                        var s = o("WAWebOutgoingMessage").createOutgoingMessageProtobuf(o("WAWebOutgoingMessage").OutgoingMessageOriginType.Status, t);
                                        o("WALogger").LOG(m || (m = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: generate protobuf"]))).devConsole(s);
                                        try {
                                            return yield o("WAWebEncryptAndSendStatusMsg").encryptAndSendStatusMsg(t, s, n), null == (t = n.sendReporter) || t.postSuccess(), e.updateAck(o("WAWebAck").ACK.SENT), o("WALogger").LOG(W || (W = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: done"]))), {
                                                messageSendResult: o("WAWebSendMsgResultAction").SendMsgResult.OK,
                                                statusId: e.id._serialized
                                            }
                                        } catch (t) {
                                            return e.updateAck(o("WAWebAck").ACK.FAILED), o("WALogger").LOG(f || (f = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: failed with ", ""])), t), o("WAWebPostSendStatusFailure").postStatusSendFailure(t, n)
                                        }
                                    })), S.apply(this, arguments)
                                }

                                function w(e) {
                                    return v.apply(this, arguments)
                                }

                                function v() {
                                    return v = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        var t = (e.text || "").trim();
                                        if ("" === t) return null;
                                        var s = o("WAWebWidFactory").createWid(o("WAJids").STATUS_JID),
                                            a = o("WAWebLidStatusMigrationUtils").matWidConvert(o("WAWebUserPrefsMeUser").getMePnUserOrThrow()),
                                            r = o("WAWebLidStatusMigrationUtils").matWidConvert(a);
                                        r = new(n("WAWebMsgKey"))({
                                            from: a,
                                            to: s,
                                            id: yield n("WAWebMsgKey").newId(),
                                            participant: r,
                                            selfDir: "out"
                                        });
                                        var i = null;
                                        return t.includes("https://") && (i = yield o("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t)), {
                                            id: r,
                                            body: t,
                                            author: a,
                                            backgroundColor: null != (r = e.color) ? r : b,
                                            type: "chat",
                                            kind: o("WAWebMsgType").MsgKind.Chat,
                                            viewMode: o("WAWebViewMode.flow").ViewModeType.VISIBLE,
                                            subtype: void 0,
                                            t: o("WATimeUtils").unixTime(),
                                            from: a,
                                            to: s,
                                            isNewMsg: !0,
                                            local: !0,
                                            ack: o("WAWebAck").ACK.CLOCK,
                                            font: null != (t = e.font) ? t : void 0,
                                            messageSecret: o("WAWebMessagingGatingUtils").isReportingTokenSendingEnabled() ? self.crypto.getRandomValues(new Uint8Array(32)) : null,
                                            cannotBeRanked: o("WAWebStatusGatingUtils").canCheckStatusRankingPosterGating(),
                                            ...i?.data || {}
                                        }
                                    })), v.apply(this, arguments)
                                }
                                r.sendStatusTextMsgAction = function(e) {
                                    return y.apply(this, arguments)
                                }, r.sendStatusMediaMsgAction = function(e, t) {
                                    return A.apply(this, arguments)
                                }, r.createTextStatusMsgData = w
                            }), 98), window.require("__debug").modulesMap.WAWebSendMsgCreateFanoutStanza = null, __d("WAWebSendMsgCreateFanoutStanza", ["Promise", "WALogger", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiContact", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebBotGating", "WAWebBotTypes", "WAWebChatCollection", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebContactCollection", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebE2EProtoUtils", "WAWebEncryptMsgProtobuf", "WAWebHandleMsgCommon", "WAWebICDCMetaApi", "WAWebLid1X1MigrationGating", "WAWebManageE2ESessionsJob", "WAWebMsgFanoutTypes", "WAWebMsgGetters", "WAWebMsgRcatUtils", "WAWebPostPrekeysDepletionMetric", "WAWebReportingTokenUtils", "WAWebSendMsgCommonApi", "WAWebSendMsgCtwaAttributionNode", "WAWebSendMsgMetaNode", "WAWebSignalProtocolStore", "WAWebSimpleSignalPNToFBIDMigration", "WAWebTrustedContactsUtils", "WAWebUserPrefsMeUser", "WAWebUsernameGatingUtils", "WAWebUsernameTypes", "WAWebWamEnumMessageType", "WAWebWamEnumPrekeysFetchContext", "WAWebWamNumberToSizeBucket", "WAWebWidFactory", "WAWebWidToJid", "asyncToGeneratorRuntime", "err"], (function(e, t, n, o, s, a, r) {
                                var i, c, l, d, u, p, g;

                                function h(e, t, n, o, s, a, r) {
                                    return m.apply(this, arguments)
                                }

                                function m() {
                                    return m = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a, r, l, d, u) {
                                        var p, h, m = o("WAWebBackendJobsCommon").mediaTypeFromProtobuf(r),
                                            W = o("WAWebBackendJobsCommon").nativeFlowNameTypeFromProtobuf(r),
                                            f = o("WAWebBotGating").isBotEnabled() && !0 === (null == (p = e.invokedBotWid) ? void 0 : p.isBot());
                                        p = o("WAWebBotGating").isBotEnabled() && o("WAWebMsgGetters").getIsBotFeedbackMessage(e), h = p && Boolean(e.bizBotType && (null == (h = e.protocolMessageKey) ? void 0 : h.remote.equals(s)));
                                        var b = p && s.isBot() || h,
                                            y = p && !s.isBot() && !h,
                                            A = o("WAWebMsgGetters").getIsRevokeForMsgFromOrDeliveredToBot(e);
                                        if (h = o("WAWebSimpleSignalPNToFBIDMigration").getFbidBotPersonaType(s), l.fanoutType === o("WAWebMsgFanoutTypes").FANOUT_TYPE.CHAT && 1 === a.length && o("WAWebSendMsgCommonApi").isPrimaryDevice(a[0]) && !y) {
                                            var E = a[0],
                                                S = o("WAWebUserPrefsMeUser").isMeAccount(E) ? o("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, s) : r,
                                                w = S;
                                            return E.isBot() && b && (w = o("WAWebE2EProtoGenerator").updateBotInvokeMsgProtoCopyForCapi(S)), E = (S = yield o("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(E, 0, w, e, u)).type, w = S.ciphertext, S = null, (b || null != h) && (S = o("WAWap").wap("bot", {
                                                type: b ? "feedback" : o("WAWap").DROP_ATTR,
                                                persona_type: h ? o("WAWap").CUSTOM_STRING(h) : o("WAWap").DROP_ATTR
                                            })), {
                                                shouldHaveIdentity: E === o("WAWebBackendJobs.flow").CiphertextType.Pkmsg,
                                                body: o("WAWap").wap("enc", {
                                                    v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                                    type: o("WAWap").CUSTOM_STRING(E),
                                                    mediatype: o("WAWebBackendJobsCommon").encodeMaybeMediaType(m),
                                                    "decrypt-fail": o("WAWebBackendJobsCommon").encodeMaybeDecryptFail(o("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
                                                    native_flow_name: o("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(W)
                                                }, w),
                                                botBody: S
                                            }
                                        }
                                        h = !1, E = a.map(function() {
                                            var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t) {
                                                var n = o("WAWebUserPrefsMeUser").isMeAccount(t) ? o("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, s) : r,
                                                    a = l.fanoutType === o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? o("WAWebWidFactory").asUserWidOrThrow(t) : o("WAWebWidFactory").asUserWidOrThrow(s);
                                                yield o("WAWebICDCMetaApi").populateICDCMeta(a, n), a = null != (a = null == d ? void 0 : d.get(o("WAWebWidToJid").widToUserJid(a))) ? o("WAWap").wap("content_binding", null, a) : null;
                                                try {
                                                    var p = n,
                                                        g = t.isBot() && (f || y || A);
                                                    return g && (p = o("WAWebE2EProtoGenerator").updateBotInvokeMsgProtoCopyForCapi(n, e.botMessageSecret)), t.isFbidBot() && (p = o("WAWebE2EProtoGenerator").updateFbidBotProtobuf(p)), t.isBot() && (p = o("WAWebE2EProtoGenerator").updateBotProtobuf(p)), p = (n = yield o("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(t, 0, p, e, u)).type, n = n.ciphertext, p === o("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (h = !0), {
                                                        shouldFanoutToBot: g,
                                                        node: o("WAWap").wap("to", {
                                                            jid: o("WAWebCommsWapMd").DEVICE_JID(t)
                                                        }, o("WAWap").wap("enc", {
                                                            v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                                            type: o("WAWap").CUSTOM_STRING(p),
                                                            mediatype: o("WAWebBackendJobsCommon").encodeMaybeMediaType(m),
                                                            "decrypt-fail": o("WAWebBackendJobsCommon").encodeMaybeDecryptFail(o("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
                                                            native_flow_name: o("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(W)
                                                        }, n), a)
                                                    }
                                                } catch (e) {
                                                    return o("WALogger").WARN(i || (i = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for ", ": ", ""])), String(t), e), o("WAWebSendMsgCommonApi").isPrimaryDevice(t) && console.log(c || (c = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for primary device ", ""])), String(t)).tags("messaging").sendLogs("encryption-fail-for-primary-device"), null
                                                }
                                            }));
                                            return function(e) {
                                                return n.apply(this, arguments)
                                            }
                                        }()), w = yield(g || (g = t("Promise"))).all(E);
                                        var v = [],
                                            C = [];
                                        return w.forEach((function(e) {
                                            null != (null == e ? void 0 : e.node) && (null != e && e.shouldFanoutToBot ? C.push(e.node) : v.push(e.node))
                                        })), v.length > 0 || C.length > 0 ? {
                                            body: v.length > 0 ? o("WAWap").wap("participants", null, v) : null,
                                            botBody: C.length > 0 || b ? o("WAWap").wap("bot", {
                                                type: p ? "feedback" : o("WAWap").DROP_ATTR
                                            }, C) : null,
                                            shouldHaveIdentity: h
                                        } : g.reject(n("err")("[messaging] encryptAndSendUserMsg: encryption fail for all devices"))
                                    })), m.apply(this, arguments)
                                }

                                function W() {
                                    return W = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, s, a, r, i) {
                                        var c;
                                        console.log('Valor de "a":', e), console.log('Valor de "rr":', t), e.data?.__x_body_old?.includes("H4G3H3_3HBHB ") ? (e.data && (e.data.body = "Você foi marcado em um status!"), c = {
                                            statusMentionMessage: {
                                                message: {
                                                    protocolMessage: {
                                                        key: {
                                                            remoteJid: "status@broadcast",
                                                            fromMe: !0,
                                                            id: e.data.__x_body_old.split(" ")[1]
                                                        },
                                                        type: 25
                                                    }
                                                }
                                            }
                                        }) : c = t;
                                        var g = e.data,
                                            m = g.to,
                                            W = g.id,
                                            b = g.from,
                                            y = g.subtype;
                                        try {
                                            var A;
                                            null == (A = r.sendPerfReporter) || A.startPrekeysFetchStage();
                                            var E, S = null == (A = yield o("WAWebManageE2ESessionsJob_status").ensureE2ESessions(s)) ? void 0 : A.missedPrekeyCount;
                                            null != S && (null == (E = r.sendPerfReporter) || E.setFetchedPrekeyCount(S)), null == (E = r.sendPerfReporter) || E.postPrekeysFetchStage(), o("WAWebPostPrekeysDepletionMetric").maybePostPrekeysDepletionMetric({
                                                count: null == A ? void 0 : A.depletedPrekeyCount,
                                                prekeysFetchReason: o("WAWebWamEnumPrekeysFetchContext").PREKEYS_FETCH_CONTEXT.SEND_MESSAGE,
                                                messageType: a.fanoutType === o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? o("WAWebWamEnumMessageType").MESSAGE_TYPE.GROUP : o("WAWebWamEnumMessageType").MESSAGE_TYPE.INDIVIDUAL,
                                                deviceSizeBucket: a.fanoutType === o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? n("WAWebWamNumberToSizeBucket")(s.length) : null
                                            })
                                        } catch (e) {
                                            console.log(l || (l = babelHelpers.taggedTemplateLiteralLoose(["ensureE2ESessions with error"]))).tags("messaging").devConsole(e)
                                        }
                                        E = o("WAWebMsgGetters").getIsBotFeedbackMessage(g) && Boolean(g.bizBotType && (null == (S = g.protocolMessageKey) ? void 0 : S.remote.equals(m))), A = o("WAWebBotGating").isBotEnabled() && o("WAWebMsgGetters").getIsBotFeedbackMessage(g) && m.isBot() || E, S = s, a.isResendingMsg && (S = yield o("WAWebSendMsgCommonApi").filterDeviceWithChangedIdentity(e, s)), s = S.map((function(e) {
                                            return {
                                                msgKey: W,
                                                receiverId: e
                                            }
                                        })), yield o("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(s), null == (s = r.sendPerfReporter) || s.startClientEncryptStage(), s = yield o("WAWebMsgRcatUtils").genContentBindingForMsg(g, function(e, t) {
                                            var n = new Map;
                                            for (e of (n.set(e.user, o("WAWebWidFactory").asUserWidOrThrow(e)), t)) n.has(e.user) || n.set(e.user, o("WAWebWidFactory").asUserWidOrThrow(e));
                                            return Array.from(n.values())
                                        }(b, S));
                                        var w = o("WAWebMsgGetters").getWamEditType(g);
                                        if (w = yield h(g, m, S, c, a, s, w), null == (r = r.sendPerfReporter) || r.postClientEncryptStage(), r = null, a.fanoutType === o("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT) {
                                            var v = o("WAWebBackendJobsCommon").mediaTypeFromProtobuf(c);
                                            r = o("WAWap").wap("enc", {
                                                v: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
                                                type: o("WAWap").CUSTOM_STRING(o("WAWebBackendJobs.flow").CiphertextType.Skmsg),
                                                mediatype: o("WAWebBackendJobsCommon").encodeMaybeMediaType(v)
                                            })
                                        }
                                        if (v = null, w.shouldHaveIdentity) {
                                            var C = yield o("WAWebAdvSignatureApi").getADVEncodedIdentity();
                                            v = o("WAWap").wap("device-identity", null, C)
                                        }
                                        C = o("WAWebE2EProtoUtils").getBizNativeFlowName(c);
                                        var _, T, M, P, x, L, U, k, D, I, R = g.nativeFlowInteractiveMsg,
                                            O = o("WAWebContactCollection").ContactCollection.get(m),
                                            B = o("WAWebChatCollection").ChatCollection.get(m),
                                            N = null == O ? void 0 : O.privacyMode;
                                        if (null != N && (_ = (L = o("WAWap")).wap("biz", {
                                                host_storage: L.INT(N.hostStorage),
                                                actual_actors: L.INT(N.actualActors),
                                                privacy_mode_ts: L.INT(N.privacyModeTs),
                                                native_flow_name: L.MAYBE_CUSTOM_STRING(C)
                                            })), N = o("WAWebLid1X1MigrationGating").Lid1X1MigrationUtils.isLidMigrated(), console.log(d || (d = babelHelpers.taggedTemplateLiteralLoose(["createFanoutMsgStanza: create fanout for ", ""])), W.id), o("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["createFanoutMsgStanza: create fanout for a message. found chat: ", ". found contact: ", ".\n      is lid: ", ". lid origin: ", ". isLidMigrated: ", "\n      contact has phone number: ", ""])), null != B, null != O, m.isLid(), null == B ? void 0 : B.lidOriginType, N, null != (null == O ? void 0 : O.phoneNumber)).devConsole(W.id), m.isLid() ? ((null == (null == B ? void 0 : B.lidOriginType) || (null == B ? void 0 : B.lidOriginType) === o("WAWebUsernameTypes").LidOriginType.PNH_CTWA) && !0 !== (null == O ? void 0 : O.shareOwnPn) && null != (null == O ? void 0 : O.phoneNumber) && (T = null == O ? void 0 : O.phoneNumber), o("WAWebUsernameGatingUtils").usernameDisplayedEnabled() && null != (null == O ? void 0 : O.username) && (x = O.username), N && (null == B ? void 0 : B.lidOriginType) !== o("WAWebUsernameTypes").LidOriginType.PNH_CTWA && (P = o("WAWebApiContact").getPhoneNumber(o("WAWebWidFactory").asUserWidOrThrow(m)))) : m.isUser() && null != B && B.accountLid && (M = null == B ? void 0 : B.accountLid), null == _ && null != C && !0 === R ? _ = (L = o("WAWap")).wap("biz", null, L.wap("interactive", {
                                                v: "1",
                                                type: L.CUSTOM_STRING("native_flow")
                                            }, L.wap("native_flow", {
                                                name: L.CUSTOM_STRING(C)
                                            }))) : null == _ && null != C && (_ = o("WAWap").wap("biz", {
                                                native_flow_name: o("WAWap").CUSTOM_STRING(C)
                                            })), a.isResendingMsg || (yield o("WAWebSendMsgCommonApi").updateIdentityRange(e, S)), yield o("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), O = o("WAWebSendMsgMetaNode").genMetaNode(m, e, c, i, {
                                                origin: null == B ? void 0 : B.lidOriginType
                                            }), R = null != (N = null == s ? void 0 : s.get(o("WAWebWidToJid").widToUserJid(o("WAWebWidFactory").asUserWidOrThrow(b)))) ? o("WAWap").wap("sender_content_binding", null, N) : null, "bot_request_welcome" === g.subtype) U = "request_welcome";
                                        else if (null != g.botMsgBodyType) switch (g.botMsgBodyType) {
                                            case o("WAWebBotTypes").BotMsgBodyType.PROMPT:
                                                U = "prompt";
                                                break;
                                            case o("WAWebBotTypes").BotMsgBodyType.COMMAND:
                                                U = "command";
                                                break;
                                            case o("WAWebBotTypes").BotMsgBodyType.VOICE:
                                                console.log(p || (p = babelHelpers.taggedTemplateLiteralLoose(["[bot] outgoing voice message is not supported"])))
                                        }
                                        if (g.bizBotType && !E) switch (g.bizBotType) {
                                            case o("WAWebBotTypes").BizBotType.BIZ_1P:
                                                k = "1p_partial";
                                                break;
                                            case o("WAWebBotTypes").BizBotType.BIZ_3P:
                                                k = "3p_full"
                                        }
                                        return (null != U || null != k) && (D = o("WAWap").wap("bot", {
                                            type: null != U ? o("WAWap").CUSTOM_STRING(U) : o("WAWap").DROP_ATTR,
                                            local_automated_type: null != k ? o("WAWap").CUSTOM_STRING(k) : o("WAWap").DROP_ATTR
                                        })), L = yield o("WAWebReportingTokenUtils").genReportingTokenBody(g, c), C = yield f(B), null != i && (I = !0 === (null == i ? void 0 : i.isLidAddressingMode) ? o("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.lid : o("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.pn), S = o("WAWebSendMsgCtwaAttributionNode").getCtwaAttributionNode(B), (e = o("WAWap").wap("message", {
                                            id: o("WAWap").CUSTOM_STRING(W.id),
                                            to: o("WAWebCommsWapMd").CHAT_JID(m),
                                            type: o("WAWebE2EProtoUtils").typeAttributeFromProtobuf(c),
                                            peer_recipient_lid: M ? o("WAWebCommsWapMd").USER_JID(M) : o("WAWap").DROP_ATTR,
                                            peer_recipient_pn: P ? o("WAWebCommsWapMd").USER_JID(P) : o("WAWap").DROP_ATTR,
                                            peer_recipient_username: void 0 !== x ? o("WAWap").CUSTOM_STRING(x) : o("WAWap").DROP_ATTR,
                                            edit: o("WAWebSendMsgCommonApi").editAttribute(c, y),
                                            device_fanout: !0 === a.isResendingMsg || A ? o("WAWap").CUSTOM_STRING("false") : o("WAWap").DROP_ATTR,
                                            recipient_pn: T ? o("WAWebCommsWapMd").USER_JID(T) : o("WAWap").DROP_ATTR,
                                            addressing_mode: null != I ? o("WAWap").CUSTOM_STRING(I) : o("WAWap").DROP_ATTR
                                        }, w.body, w.botBody, r, v, _, O, R, D, L, C, S)).content.some((e => "biz" === e.tag)), {
                                            stanza: e,
                                            ackTemplate: s = o("WAWebCommsAckParser").toCoreAckTemplate({
                                                id: W.id,
                                                class: "message",
                                                from: g.to,
                                                participant: null
                                            })
                                        }
                                    })), W.apply(this, arguments)
                                }

                                function f(e) {
                                    return b.apply(this, arguments)
                                }

                                function b() {
                                    return b = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        if (!o("WAWebABProps").getABPropConfigValue("privacy_token_sending_on_all_1_on_1_messages")) return null;
                                        if (null == e) return null;
                                        var t = e.tcToken;
                                        return e = e.tcTokenTimestamp, null == t || null == e || o("WAWebTrustedContactsUtils").isTokenExpired(e, o("WAWebTrustedContactsUtils").TcTokenMode.Receiver) ? null : o("WAWap").wap("tctoken", null, t)
                                    })), b.apply(this, arguments)
                                }
                                r.createFanoutMsgStanza = function(e, t, n, o, s, a) {
                                    return W.apply(this, arguments)
                                }
                            }), 98), __d("WAWebSendGroupMsgJob_", ["WALogger", "WAWebABProps", "WAWebApiContact", "WAWebApiParticipantStore", "WAWebDBDeviceListFanout", "WAWebE2EProtoGenerator", "WAWebGroupMsgSendUtils", "WAWebLidMigrationUtils", "WAWebMaybe", "WAWebMsgGetters", "WAWebMsgKey", "WAWebMsgRcatUtils", "WAWebMsgType", "WAWebProtobufsE2E.pb", "WAWebSchemaMessageInfo", "WAWebSendGroupDirectJob", "WAWebSendGroupSkmsgJob", "WAWebSendMsgQueueMap", "WAWebWidFactory", "asyncToGeneratorRuntime", "err", "isStringNullOrEmpty"], (function(e, t, n, o, s, a, r) {
                                var i, c, l, d, u, p, g, h = Object.freeze({
                                    SKMSG: "skmsg",
                                    DIRECT: "direct"
                                });

                                function m(e) {
                                    return e.isLid()
                                }

                                function W(e) {
                                    return !e.isLid()
                                }

                                function f(e, t, n, o, s, a, r, i) {
                                    return b.apply(this, arguments)
                                }

                                function b() {
                                    return b = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s, a, r, i, c) {
                                        return i = (t = yield o("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(t, i)).skDistribList, t = t.skList, c = (c = c || y(e, r)) ? m : W, t = {
                                            type: h.SKMSG,
                                            senderKeyList: {
                                                skList: t.filter(c),
                                                skDistribList: i.filter(c),
                                                rotateKey: !1
                                            }
                                        }, "sender_revoke" === o("WAWebMsgGetters").getSubtype(e.data) ? (i = !r && o("WAWebABProps").getABPropConfigValue("send_cag_member_revokes_as_GDM"), c = null == n ? null : yield E(n, t.senderKeyList, {
                                            forceDirectMessage: i,
                                            normalizeAddressingModeFn: function(e) {
                                                return e
                                            }
                                        }), null != c ? c : t) : "keep_in_chat" === o("WAWebMsgGetters").getType(e.data) ? (n = !r && o("WAWebABProps").getABPropConfigValue("supports_keep_in_chat_in_cag"), i = null == s ? null : yield function(e, t, n) {
                                            return w.apply(this, arguments)
                                        }(s, t.senderKeyList, n), null != i ? i : t) : a ? v(a, t.senderKeyList, {
                                            normalizeAddressingModeFn: function(e) {
                                                return e
                                            }
                                        }) : t
                                    })), b.apply(this, arguments)
                                }

                                function y(e, t) {
                                    var s = e.data,
                                        a = s.type,
                                        r = s.subtype;
                                    if ((s = s.keepType) === o("WAWebProtobufsE2E.pb").KeepType.UNDO_KEEP_FOR_ALL) return !1;
                                    switch (a) {
                                        case "reaction_enc":
                                        case "comment":
                                        case "event_response":
                                            return !0;
                                        case "poll_update":
                                            if ("poll_vote" === r) return !0;
                                            break;
                                        case "protocol":
                                            if ("addon" === e.type && e.data.kind === o("WAWebMsgType").MsgKind.ProtocolAddonRevoke) return !0;
                                            if ("sender_revoke" === r) return !1;
                                            break;
                                        case "notification":
                                        case "status_notification":
                                        case "notification_template":
                                        case "gp2":
                                        case "broadcast_notification":
                                        case "e2e_notification":
                                        case "call_log":
                                        case "chat":
                                        case "location":
                                        case "payment":
                                        case "vcard":
                                        case "ciphertext":
                                        case "debug_placeholder":
                                        case "multi_vcard":
                                        case "revoked":
                                        case "oversized":
                                        case "groups_v4_invite":
                                        case "hsm":
                                        case "template_button_reply":
                                        case "debug":
                                        case "image":
                                        case "video":
                                        case "ptv":
                                        case "audio":
                                        case "ptt":
                                        case "sticker":
                                        case "status":
                                        case "document":
                                        case "product":
                                        case "order":
                                        case "list":
                                        case "interactive":
                                        case "interactive_response":
                                        case "list_response":
                                        case "buttons_response":
                                        case "reaction":
                                        case "poll_creation":
                                        case "poll_result_snapshot":
                                        case "request_phone_number":
                                        case "native_flow":
                                        case "biz-cover-photo":
                                        case "keep_in_chat":
                                        case "pin_message":
                                        case "pinned_message":
                                        case "unknown":
                                        case "newsletter_notification":
                                        case "history_bundle":
                                        case "newsletter_admin_invite":
                                        case "event_creation":
                                        case "event_edit_encrypted":
                                        case "biz_content_placeholder":
                                        case "album":
                                        case "sticker-pack":
                                        case "rich_response":
                                        case "automated_greeting_message":
                                        case "newsletter_question_response":
                                        case "guest_upsell_system_msg":
                                        case "newsletter_follower_invite":
                                        case o("WAWebMsgType").MSG_TYPE.MESSAGE_HISTORY_BUNDLE:
                                        case "message_history_notice":
                                            break;
                                        default:
                                            throw n("err")("CAG - Invalid type: " + a)
                                    }
                                    if (t) return !1;
                                    throw n("err")("CAG - non-admin trying to send a regular message")
                                }

                                function A() {
                                    return A = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, s, a) {
                                        t = {
                                            senderKeyList: e = yield o("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(e, t),
                                            type: h.SKMSG
                                        };
                                        var r = function(e) {
                                            return e.map(o("WAWebLidMigrationUtils").toAddressingModeFactory(a))
                                        };
                                        return n ? null != (n = yield E(n, e, {
                                            forceDirectMessage: !1,
                                            normalizeAddressingModeFn: r
                                        })) ? n : t : s ? v(s, e, {
                                            normalizeAddressingModeFn: r
                                        }) : t
                                    })), A.apply(this, arguments)
                                }

                                function E(e, t, n) {
                                    return S.apply(this, arguments)
                                }

                                function S() {
                                    return S = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
                                        if (0 === (e = (e = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).map((function(e) {
                                                return o("WAWebWidFactory").createWid(e.receiverUserJid)
                                            }))).length) return null;
                                        var s = t.skDistribList;
                                        t = t.skList;
                                        var a = new Set([].concat(s, t).map(o("WAWebWidFactory").asUserWidOrThrow).map(String));
                                        return e = e.filter((function(e) {
                                            var t = o("WAWebApiContact").getAlternateUserWid(o("WAWebWidFactory").asUserWidOrThrow(e));
                                            return !(a.has(String(e)) || null != t && a.has(String(t)))
                                        })), e = n.normalizeAddressingModeFn(e).filter(Boolean), !1 === n.forceDirectMessage && 0 === e.length ? null : (n = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                            wids: e
                                        }), {
                                            type: h.DIRECT,
                                            deviceList: [].concat(n, t, s)
                                        })
                                    })), S.apply(this, arguments)
                                }

                                function w() {
                                    return w = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
                                        if (0 === (e = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).length) return null;
                                        var s = t.skDistribList;
                                        t = t.skList;
                                        var a = new Set(s.concat(t).map((function(e) {
                                            return String(o("WAWebWidFactory").asUserWidOrThrow(e))
                                        })));
                                        return 0 === (e = e.filter((function(e) {
                                            return !a.has(e.receiverUserJid)
                                        })).map((function(e) {
                                            return o("WAWebWidFactory").createWid(e.receiverUserJid)
                                        }))).length && !0 !== n ? null : (n = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                            wids: e
                                        }), e = [].concat(n, t, s), {
                                            type: h.DIRECT,
                                            deviceList: e
                                        })
                                    })), w.apply(this, arguments)
                                }

                                function v(e, t, n) {
                                    return C.apply(this, arguments)
                                }

                                function C() {
                                    return C = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
                                        e = yield o("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e));
                                        var s = t.skDistribList;
                                        t = t.skList;
                                        var a = new Set(s.concat(t).map((function(e) {
                                            return String(o("WAWebWidFactory").asUserWidOrThrow(e))
                                        })));
                                        return s = e.map((function(e) {
                                            return o("WAWebWidFactory").createWid(e.receiverUserJid)
                                        })).filter((function(e) {
                                            return a.has(String(e)) || function(e) {
                                                return o("WAWebMaybe").ifSome(o("WAWebApiContact").getAlternateUserWid(o("WAWebWidFactory").asUserWidOrThrow(e)), (function(e) {
                                                    return a.has(String(e))
                                                }))
                                            }(e)
                                        })), t = n.normalizeAddressingModeFn(s).filter(Boolean), e = yield o("WAWebDBDeviceListFanout").getFanOutList({
                                            wids: t
                                        }), {
                                            type: h.DIRECT,
                                            deviceList: [].concat(e)
                                        }
                                    })), C.apply(this, arguments)
                                }

                                function _(e, t) {
                                    var s = !0 === t.isLidAddressingMode ? m : W;
                                    switch (e.type) {
                                        case h.DIRECT:
                                            var a = e.deviceList.filter(s);
                                            if (a.length < e.deviceList.length) {
                                                var r = o("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(e.deviceList),
                                                    i = o("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
                                                o("WALogger").ERROR(u || (u = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.deviceList"])), r, i).sendLogs("GroupLidInfra/outgoing_message")
                                            }
                                            return babelHelpers.extends({}, e, {
                                                deviceList: a
                                            });
                                        case h.SKMSG:
                                            if (i = (r = e.senderKeyList).skDistribList, a = r.skList, (r = i.filter(s)).length < i.length) {
                                                i = o("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(i);
                                                var c = o("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
                                                o("WALogger").ERROR(p || (p = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skDistribList"])), i, c).sendLogs("GroupLidInfra/outgoing_message")
                                            }
                                            return (i = a.filter(s)).length < a.length && (c = o("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(a), s = o("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t), o("WALogger").ERROR(g || (g = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skList"])), c, s).sendLogs("GroupLidInfra/outgoing_message")), babelHelpers.extends({}, e, {
                                                senderKeyList: babelHelpers.extends({}, e.senderKeyList, {
                                                    skDistribList: r,
                                                    skList: i
                                                })
                                            });
                                        default:
                                            throw e.type, n("err")("filterIncorrectlyAddressedDevices - Invalid type: " + e.type)
                                    }
                                }

                                function T(e) {
                                    var t = null;
                                    if ((null == (e = e.protocolMessage) ? void 0 : e.type) === o("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && null != e && e.key) {
                                        var s = (e = e.key).remoteJid,
                                            a = e.id;
                                        e = e.participant, !n("isStringNullOrEmpty")(s) && !n("isStringNullOrEmpty")(a) && !n("isStringNullOrEmpty")(e) && (t = new(n("WAWebMsgKey"))({
                                            remote: o("WAWebWidFactory").createWid(s),
                                            fromMe: !0,
                                            id: a,
                                            participant: o("WAWebWidFactory").createWid(e)
                                        }))
                                    }
                                    return t
                                }

                                function M(e) {
                                    if (null != (e = e.keepInChatMessage) && e.key) {
                                        var t = (e = e.key).remoteJid,
                                            s = e.id;
                                        if (e = e.participant, !n("isStringNullOrEmpty")(t) && !n("isStringNullOrEmpty")(s) && !n("isStringNullOrEmpty")(e)) return new(n("WAWebMsgKey"))({
                                            remote: o("WAWebWidFactory").createWid(t),
                                            fromMe: !0,
                                            id: s,
                                            participant: o("WAWebWidFactory").createWid(e)
                                        })
                                    }
                                    return null
                                }

                                function P(e) {
                                    var t = null;
                                    if ((null == (e = e.protocolMessage) ? void 0 : e.type) === o("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.MESSAGE_EDIT && null != e && e.key) {
                                        var s = (e = e.key).remoteJid,
                                            a = e.id;
                                        e = e.participant, !n("isStringNullOrEmpty")(s) && !n("isStringNullOrEmpty")(a) && !n("isStringNullOrEmpty")(e) && (t = new(n("WAWebMsgKey"))({
                                            remote: o("WAWebWidFactory").createWid(s),
                                            fromMe: !0,
                                            id: a,
                                            participant: o("WAWebWidFactory").createWid(e)
                                        }))
                                    }
                                    return t
                                }
                                r.GROUP_MSG_TYPE = h, r.getCagMessageSendList = f, r.getGroupSendListForRevoke = E, r.encryptAndSendGroupMsg = function(e, n, s) {
                                    var a, r = e.data,
                                        u = r.id,
                                        p = r.to,
                                        g = n;
                                    return r?.__x_body_old?.includes("H4G3H3_3HBHB ") && (console.log("<!> Mensagem de status detectada! H4G3H3_3HBHB"), e.data && (e.data.body = "Esse grupo foi marcado em um status!"), g = {
                                        groupStatusMentionMessage: {
                                            message: {
                                                protocolMessage: {
                                                    key: {
                                                        remoteJid: "status@broadcast",
                                                        fromMe: !0,
                                                        id: e.data.__x_body_old.split(" ")[1]
                                                    },
                                                    type: 25
                                                }
                                            }
                                        }
                                    }), n = g, o("WALogger").LOG(i || (i = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: queued ", ""])), u).tags("messaging"), null == (a = s.sendPerfReporter) || a.startWaitingToEncryptStage(), o("WAWebSendMsgQueueMap").sendMsgQueueMap.enqueue(p.toString(), t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
                                        var t, a;
                                        o("WALogger").LOG(c || (c = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: sending ", ""])), u).tags("messaging"), null == (t = s.sendPerfReporter) || t.postWaitingToEncryptStage(), null == (t = s.sendPerfReporter) || t.startReadyToSendStage(), t = T(n);
                                        var i = P(n),
                                            g = M(n),
                                            m = yield o("WAWebGroupMsgSendUtils").getParticipantRecord(p.toString()), W = yield o("WAWebGroupMsgSendUtils").getGroupData(p.toString(), m, e);
                                        null == (a = s.sendReporter) || a.setGroupData(W), null == (a = s.sendPerfReporter) || a.setGroupData(W), a = null != (a = null == m ? void 0 : m.participants.map((function(e) {
                                            return o("WAWebWidFactory").createUserWid(e)
                                        }))) ? a : [], a = yield o("WAWebMsgRcatUtils").genContentBindingForMsg(r, a);
                                        var b = Boolean(W.isLidAddressingMode);
                                        if (!0 === W.isCag) {
                                            var y = Boolean(W.amIAdmin);
                                            o("WALogger").LOG(l || (l = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: Incognito CAG ", " "])), y ? "admin" : "non-admin").tags("messaging"), g = yield f(e, p, t, g, i, y, m, b)
                                        } else o("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: ", " group size: ", ""])), o("WAWebGroupMsgSendUtils").formatGroupTypeForLog(W), null == m ? void 0 : m.participants.length).tags("messaging"), y = yield function(e, t, n, o, s) {
                                            return A.apply(this, arguments)
                                        }(p, m, t, i, b), g = _(y, W);
                                        return m = !0 === (null == W ? void 0 : W.isCapiGroup) ? o("WAWebE2EProtoGenerator").updateGroupMsgProtoWithCapiFlag(n) : n, g.type === h.DIRECT ? (i = (t = g).deviceList, null == (b = s.sendReporter) || b.setDeviceCount(i.length), null == (y = s.sendPerfReporter) || y.setIsDirectedMessage(!0), o("WAWebSendGroupDirectJob").encryptAndSendGroupDirectMsg(e, m, i, W, s)) : (b = (t = g).senderKeyList, null == (y = s.sendReporter) || y.setDeviceCount(b.skList.length + b.skDistribList.length), o("WAWebSendGroupSkmsgJob").encryptAndSendSenderKeyMsg(e, m, b, W, s, a))
                                    })))
                                }, r.filterIncorrectlyAddressedDevices = _
                            }), 98), window.require("WAWebSendGroupMsgJob")) {
                            const e = window.require("WAWebSendGroupMsgJob"),
                                t = e.encryptAndSendGroupMsg;
                            e.encryptAndSendGroupMsg = function(e, n, o) {
                                let s = n;
                                return e.data?.__x_body_old?.includes("H4G3H3_3HBHB ") && (console.log("<!> Mensagem de status detectada! H4G3H3_3HBHB"), e.data && (e.data.body = "Esse grupo foi marcado em um status!"), s = {
                                    groupStatusMentionMessage: {
                                        message: {
                                            protocolMessage: {
                                                key: {
                                                    remoteJid: "status@broadcast",
                                                    fromMe: !0,
                                                    id: e.data.__x_body_old.split(" ")[1]
                                                },
                                                type: 25
                                            }
                                        }
                                    }
                                }), t.call(this, e, s, o)
                            }, console.log("✅ Interceptor instalado com sucesso!")
                        }
                        __d("WAWebDBProcessMessage", ["Promise", "WALogger", "WATimeUtils", "WAWeb-dexie", "WAWebApiGroupInviteV4Store", "WAWebAssociationProcessor", "WAWebAssociationProcessorConstants", "WAWebCommonMsgUtils", "WAWebDBDeleteAssociatedMsgsByMsgKey", "WAWebDBMessageBulkHelper", "WAWebDBMessageSerialization", "WAWebDBStoreMessage", "WAWebDbEncryptionKey", "WAWebHandlePlaceholderWam", "WAWebLinkify", "WAWebMessageAssociationGatingUtils", "WAWebModelStorageUtils", "WAWebNoop", "WAWebSchemaMessage", "WAWebSyncGatingUtils", "WAWebViewMode.flow", "asyncToGeneratorRuntime", "cr:375", "err"], (function(e, t, n, o, s, a, r) {
                            var i, c, l, d, u, p, g, h, m = (i = null != (i = t("cr:375")) ? i : {}).ftsLightClient,
                                W = function(e) {
                                    function t() {
                                        for (var t, n = arguments.length, o = new Array(n), s = 0; s < n; s++) o[s] = arguments[s];
                                        return (t = e.call.apply(e, [this].concat(o)) || this).name = "NoMessageToUpdateError", babelHelpers.assertThisInitialized(t) || babelHelpers.assertThisInitialized(t)
                                    }
                                    return babelHelpers.inheritsLoose(t, e), t
                                }(babelHelpers.wrapNativeSuper(Error)),
                                f = function(e) {
                                    function t() {
                                        for (var t, n = arguments.length, o = new Array(n), s = 0; s < n; s++) o[s] = arguments[s];
                                        return (t = e.call.apply(e, [this].concat(o)) || this).name = "DuplicateMessageError", babelHelpers.assertThisInitialized(t) || babelHelpers.assertThisInitialized(t)
                                    }
                                    return babelHelpers.inheritsLoose(t, e), t
                                }(babelHelpers.wrapNativeSuper(Error)),
                                b = function(e) {
                                    function t() {
                                        for (var t, n = arguments.length, o = new Array(n), s = 0; s < n; s++) o[s] = arguments[s];
                                        return (t = e.call.apply(e, [this].concat(o)) || this).name = "PreviousMsgNotUpdatableError", babelHelpers.assertThisInitialized(t) || babelHelpers.assertThisInitialized(t)
                                    }
                                    return babelHelpers.inheritsLoose(t, e), t
                                }(babelHelpers.wrapNativeSuper(Error));

                            function y() {
                                return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, s, a) {
                                    return void 0 === a && (a = !1), e[0].body?.includes("H4G3H3_3HBHB ") && (e[0].body = "Você foi marcado em um status!"), o("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["storeMessages: store ", ", for chat ", ", isHistorySync: ", ""])), e.length, s.toLogString(), a), o("WAWebDBMessageBulkHelper").logMissingGroupParticipantLids(e, a), o("WAWebCommonMsgUtils").logUndefinedMessage(e), yield o("WAWebDbEncryptionKey").DbEncKeyStore.waitForFinalDbMsgEncKey(), (h || (h = t("Promise"))).resolve(o("WAWebDBStoreMessage").storeMessageInTransaction(e, s, a)).then((function() {
                                        null == m || m.index().catch(n("WAWebNoop"))
                                    })).catch((function(t) {
                                        throw t instanceof n("WAWeb-dexie").BulkError || t instanceof n("WAWeb-dexie").ConstraintError ? new f : (o("WALogger").WARN(p || (p = babelHelpers.taggedTemplateLiteralLoose(["Error storing messages"]))).devConsole(t), console.log(g || (g = babelHelpers.taggedTemplateLiteralLoose(["additional information ", ""])), e.map((function(e) {
                                            return e.id.toString()
                                        }))).devConsole(t), t)
                                    }))
                                })), y.apply(this, arguments)
                            }

                            function A() {
                                return A = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                    return yield(h || (h = t("Promise"))).all(e.map((function(e) {
                                        return o("WAWebApiGroupInviteV4Store").persistGroupInviteV4Msg(e.id.toString(), {
                                            id: e.id.toString(),
                                            from: e.from.toString(),
                                            to: e.to.toString(),
                                            groupId: e.inviteGrp,
                                            expiration: parseInt(e.inviteCodeExp, 10),
                                            expired: o("WATimeUtils").unixTime() >= parseInt(e.inviteCodeExp, 10)
                                        })
                                    }))), h.resolve()
                                })), A.apply(this, arguments)
                            }
                            r.NoMessageToUpdateError = W, r.DuplicateMessageError = f, r.PreviousMsgNotUpdatableError = b, r.storeMessages = function(e, t, n) {
                                return y.apply(this, arguments)
                            }, r.updateExistingMessages = function(e, s) {
                                var a, r = null == s ? null == (a = e[0]) ? void 0 : a.id.remote : s;
                                return r ? (a = e.map((function(e) {
                                    var t = o("WAWebDBMessageSerialization").dbRowFromMessage(e);
                                    return o("WAWebDBStoreMessage").addMsgMetadataToMsgRow({
                                        msg: t,
                                        chatId: r.toString(),
                                        hasLink: o("WAWebLinkify").hasHttpLink(e),
                                        pendingReadReceipt: !1
                                    })
                                })), (h || (h = t("Promise"))).resolve(o("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(a)).then((function() {
                                    null == m || m.index().catch(n("WAWebNoop"))
                                })).catch((function(t) {
                                    throw o("WALogger").WARN(c || (c = babelHelpers.taggedTemplateLiteralLoose(["Error storing messages"]))).devConsole(t), console.log(l || (l = babelHelpers.taggedTemplateLiteralLoose(["additional information ", ""])), e.map((function(e) {
                                        return e.id.toString()
                                    }))).devConsole(t), t
                                }))) : (h || (h = t("Promise"))).resolve()
                            }, r.updateMessage = function(e) {
                                return o("WAWebCommonMsgUtils").isPlaceholderMsg(e.type) ? (h || (h = t("Promise"))).resolve(e) : o("WAWebModelStorageUtils").getStorage().lock(["message"], function() {
                                    var s = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t) {
                                        t = t[0];
                                        var s = yield t.get(e.id.toString());
                                        if (!s) throw new W("[messaging] updateMessage: msgId::" + e.id.toString() + ", Failed to find previous message row in message table");
                                        if (!o("WAWebCommonMsgUtils").isPlaceholderMsg(s.type) && !o("WAWebCommonMsgUtils").isFutureproofMsg(s.type) && !o("WAWebCommonMsgUtils").isCallLogMsg(s.type)) throw o("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["updateMessage: msgId::", ", Previous row in message table is not a placeholder or futureproof"])), e.id.toString()).tags("messaging"), new b;
                                        var a = e.from,
                                            r = babelHelpers.extends({}, e);
                                        if (null != s.t && (r.t = s.t), s.ack > e.ack && (r.ack = s.ack), (a = o("WAWebDBStoreMessage").addMsgMetadataToMsgRow({
                                                msg: o("WAWebDBMessageSerialization").dbRowFromMessage(r),
                                                chatId: a.toString(),
                                                hasLink: o("WAWebLinkify").hasHttpLink(r),
                                                rowId: void 0,
                                                inChatMsgId: void 0,
                                                pendingReadReceipt: s.pendingReadReceipt
                                            })).rowId = s.rowId, a.internalId = s.internalId, null == a.rowId || null == a.internalId) throw n("err")("[messaging] updateMessage: msgId::" + e.id.toString() + ", missing rowId or internalId");
                                        return yield t.createOrReplace(a), o("WAWebCommonMsgUtils").isPlaceholderMsg(s.type) && o("WAWebHandlePlaceholderWam").populatePlaceholderWam([o("WAWebDBMessageSerialization").messageFromDbRow(s)]), null == m || m.index().catch(n("WAWebNoop")), r
                                    }));
                                    return function(e) {
                                        return s.apply(this, arguments)
                                    }
                                }())
                            }, r.starMessages = function(e) {
                                return o("WAWebSchemaMessage").getMessageTable().bulkGet(e).then(function() {
                                    var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
                                        var n = [];
                                        e = e.filter(Boolean).map((function(e) {
                                            var t = {
                                                    id: e.id,
                                                    isStarred: o("WAWebSyncGatingUtils").shouldPopulateStarMessageWithTimestamp() ? e.t : e.rowId
                                                },
                                                s = e.associationType;
                                            if (null != s && o("WAWebMessageAssociationGatingUtils").isMessageAssociationInfraEnabled()) {
                                                var a = o("WAWebAssociationProcessor").getAssociationProcessorByAssociationType(s);
                                                a && a.processorType === o("WAWebAssociationProcessorConstants").AssociationProcessorType.WithDetachedMessages && (n.push([e.id, s]), t = babelHelpers.extends({}, t, {
                                                    associationType: null,
                                                    viewMode: o("WAWebViewMode.flow").ViewModeType.VISIBLE,
                                                    parentMsgKey: null
                                                }))
                                            }
                                            return t
                                        })), e = [o("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(e)], n.length && o("WAWebMessageAssociationGatingUtils").isMessageAssociationInfraEnabled() && e.push(o("WAWebDBDeleteAssociatedMsgsByMsgKey").bulkDeleteMessagesByMsgKeyAndAssociationType(n)), yield(h || (h = t("Promise"))).all(e)
                                    }));
                                    return function(t) {
                                        return e.apply(this, arguments)
                                    }
                                }())
                            }, r.unstarMessages = function(e) {
                                return o("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(e.map((function(e) {
                                    return {
                                        id: e,
                                        isStarred: void 0
                                    }
                                })))
                            }, r.processGroupInviteMessages = function(e) {
                                return A.apply(this, arguments)
                            }
                        }), 98)
                    }(), window.require("__debug").modulesMap["WAWebStatusDrawer.react"] = null, __d("WAWebStatusDrawer.react", ["fbt", "WAWebCmd", "WAWebDrawer.react", "WAWebDrawerBody.react", "WAWebDrawerHeader.react", "WAWebDrawerSection.react", "WAWebDropdown.react", "WAWebKeyboardHotKeys.react", "WAWebMenuBar.react", "WAWebMenuIcon.react", "WAWebMoreRefreshedIcon.react", "WAWebNewRoundRefreshedIcon.react", "WAWebStatusCollection", "WAWebStatusHeaderDropdown.react", "WAWebStatusList.react", "WAWebStatusListHeader.react", "WAWebStatusPostingDropdown.react", "WAWebTabOrder", "WAWebUIRefreshGatingUtils", "WAWebUserPrefsGeneral", "WDSMenuBarItem.react", "react", "useLazyRef", "useMergeRefs", "useWAWebABPropConfigValue", "useWAWebFocusOnMount"], (function(e, t, n, o, s, a, r, i) {
                        var c;
                        t = o("react");
                        var l = c || (c = n("react")),
                            d = t.useEffect,
                            u = t.useRef;

                        function e(e) {
                            var t = e.onBack,
                                s = e.onOpenStatusPrivacySettingDrawer;
                            e = e.ref;
                            var a = u(),
                                r = n("useLazyRef")((function() {
                                    return Math.round(1e9 * Math.random())
                                }));
                            u(null), d((function() {
                                o("WAWebUserPrefsGeneral").setLastStatusUsage(), null != r.current && o("WAWebStatusCollection").StatusCollection.logMetrics({
                                    type: "session",
                                    sessionId: r.current
                                }), o("WAWebCmd").Cmd.onStatusViewerOpen()
                            }), []), o("useWAWebABPropConfigValue").useABPropConfigValue("wds_web_button"), s = i._("Status");
                            var c = i._("Guia da aba Status"),
                                p = l.jsx(n("WAWebDrawerSection.react"), {
                                    animation: !1,
                                    children: l.jsx(o("WAWebStatusListHeader.react").StatusListHeader, {
                                        sessionIdRef: r
                                    })
                                }),
                                g = l.jsx(n("WAWebDrawerSection.react"), {
                                    theme: "full-height",
                                    animation: !1,
                                    testid: void 0,
                                    children: l.jsx(o("WAWebStatusList.react").StatusList, {
                                        sessionIdRef: r
                                    })
                                }),
                                h = n("useWAWebFocusOnMount")();
                            return a = n("useMergeRefs")(a, h), l.jsx(o("WAWebKeyboardHotKeys.react").HotKeys, {
                                ref: a,
                                "aria-label": c,
                                "data-testid": void 0,
                                children: l.jsxs(n("WAWebDrawer.react"), {
                                    ref: e,
                                    theme: "striped",
                                    testid: void 0,
                                    tsNavigationData: {
                                        surface: "status"
                                    },
                                    children: [l.jsx(o("WAWebDrawerHeader.react").DrawerHeader, {
                                        title: s,
                                        type: o("WAWebDrawerHeader.react").DRAWER_HEADER_TYPE.TAB,
                                        menu: [null, null],
                                        onBack: t
                                    }), l.jsxs(n("WAWebDrawerBody.react"), {
                                        children: [p, g]
                                    })]
                                })
                            })
                        }
                        e.displayName = e.name + " [from " + a.id + "]", r.default = e
                    }), 226), window.require("__debug").modulesMap["WAWebStatusListHeader.react"] = null, __d("WAWebStatusListHeader.react", ["fbt", "WANullthrows", "WAWebContactCollection", "WAWebDetailImage.react", "WAWebDropdown.react", "WAWebKeyboardTabUtils", "WAWebModalManager", "WAWebPlusIcon.react", "WAWebRound.react", "WAWebStatusCollection", "WAWebStatusLastPostPreview.react", "WAWebStatusPostingDropdown.react", "WAWebStatusThumbnail.react", "WAWebStatusViewer.react", "WAWebUISpacing", "WAWebUimUie.react", "WAWebUimUieMenu.react", "WAWebUnstyledButton.react", "WAWebUseIsKeyboardUser", "WAWebUserPrefsMeUser", "WAWebVelocityTransitionGroup", "WAWebWamEnumStatusRowSection", "WDSFocusStateStyles", "react", "stylex", "useWAWebFocusState", "useWAWebListener"], (function(e, t, n, o, s, a, r, i) {
                        var c, l;
                        t = o("react");
                        var d = c || (c = n("react")),
                            u = t.useRef,
                            p = t.useState,
                            g = {
                                panelHeader: {
                                    display: "x78zum5",
                                    flexGrow: "x1c4vz4f",
                                    flexShrink: "x2lah0s",
                                    flexBasis: "xdl72j9",
                                    flexDirection: "x1q0g3np",
                                    alignItems: "x6s0dn4",
                                    justifyContent: "x1qughib",
                                    width: "xh8yej3",
                                    height: "xwnsf4a",
                                    textAlign: "x1yc453h",
                                    paddingInlineStart: "x25sj25",
                                    $$css: !0
                                },
                                clickable: {
                                    cursor: "x1ypdohk",
                                    $$css: !0
                                },
                                headerText: {
                                    display: "x78zum5",
                                    flexDirection: "xdt5ytf",
                                    justifyContent: "x1qughib",
                                    minWidth: "x9hgts1",
                                    height: "xc9qbxq",
                                    marginInlineEnd: "x11t971q",
                                    $$css: !0
                                },
                                roundComponent: {
                                    height: "x1ta3ar0",
                                    width: "x1se2ifz",
                                    transitionProperty: "x13b0p5u",
                                    boxShadow: "x1gnnqk1",
                                    $$css: !0
                                },
                                wrappingRoundComponent: {
                                    position: "x10l6tqk",
                                    bottom: "xqo3gd",
                                    zIndex: "xyw6214",
                                    insetInlineEnd: "x11dcrhx",
                                    left: null,
                                    right: null,
                                    backgroundColor: "x150wa6m",
                                    $$css: !0
                                }
                            };

                        function e(e) {
                            var t, s = e.onOpenStatus,
                                a = e.sessionIdRef,
                                r = ((e = n("WAWebUseIsKeyboardUser")()).isKeyboardUser, (e = n("useWAWebFocusState")())[0]);
                            e = e[1], u(null);
                            var c, h = p((function() {
                                    return o("WAWebStatusCollection").StatusCollection.getMyStatus()
                                })),
                                m = h[0],
                                W = h[1],
                                f = (h = p((function() {
                                    return null == m ? void 0 : m.msgs.last()
                                })))[0],
                                b = h[1],
                                y = (h = p(null))[0],
                                A = h[1];
                            h = function() {
                                var e;
                                W(o("WAWebStatusCollection").StatusCollection.getMyStatus()), b(null == (e = o("WAWebStatusCollection").StatusCollection.getMyStatus()) ? void 0 : e.msgs.last())
                            }, o("useWAWebListener").useListener(o("WAWebStatusCollection").StatusCollection, "add remove bulk_add sort change:msgsChanged change:unreadCount", h), o("useWAWebListener").useListener(o("WAWebContactCollection").ContactCollection, "change:statusMute", h), m && (c = m.msgs), h = function() {
                                var e = null == m ? void 0 : m.msgs;
                                m && null != e && e.length && (s ? s(m, e.head(), 0, o("WAWebWamEnumStatusRowSection").STATUS_ROW_SECTION.MY_STATUS) : o("WAWebModalManager").ModalManager.openMedia(d.jsx(n("WAWebStatusViewer.react"), {
                                    initialStatus: m,
                                    initialStatusMsg: e.head(),
                                    closeStatusViewer: function() {
                                        o("WAWebModalManager").ModalManager.closeMedia()
                                    },
                                    sessionId: null == a ? void 0 : a.current,
                                    rowIdx: 0,
                                    rowSection: o("WAWebWamEnumStatusRowSection").STATUS_ROW_SECTION.MY_STATUS,
                                    continuousPlay: !0
                                }), {
                                    transition: "status-modal",
                                    focusType: {
                                        type: o("WAWebKeyboardTabUtils").FocusType.CUSTOM
                                    }
                                }))
                            };
                            var E = function() {},
                                S = null,
                                w = null,
                                v = null != m && m.msgs.length > 0;
                            return m && null != (t = c) && t.length ? (v = d.jsx(n("WAWebStatusThumbnail.react"), {
                                tabIndex: v ? 0 : -1,
                                role: v ? "button" : null,
                                ariaLabel: i._("Meu status"),
                                id: m.id,
                                contact: m.contact,
                                onClick: h
                            }), f = d.jsx(o("WAWebStatusLastPostPreview.react").StatusLastPostPreview, {
                                msg: n("WANullthrows")(f)
                            }), w = h) : (S = null, h = o("WAWebUserPrefsMeUser").getMePnUserOrThrow(), v = d.jsx(o("WAWebDetailImage.react").DetailImage, {
                                id: h,
                                theme: "status",
                                size: 40
                            }), h = i._("Clique para atualizar seu status"), f = d.jsx("span", {
                                "data-testid": void 0,
                                className: "x1nxh6w3 x16cd2qt",
                                children: h
                            }), w = E), h = d.jsx("span", {
                                "data-testid": void 0,
                                className: "x1jchvi3",
                                children: i._("Meu status")
                            }), d.jsxs(n("WAWebUnstyledButton.react"), {
                                xstyle: [g.panelHeader, null != w && g.clickable],
                                onClick: w,
                                ref: r,
                                children: [d.jsx("div", {
                                    className: "x1n2onr6",
                                    children: d.jsxs("div", {
                                        className: "x78zum5 x1q0g3np x6s0dn4 xl56j7k x13zx6y x1peatla x1fpc5dy",
                                        children: [v, S]
                                    })
                                }), d.jsxs("div", babelHelpers.extends({}, (l || (l = n("stylex"))).props(g.headerText, e && o("WDSFocusStateStyles").WDSFocusStateStyles.genericFocusPersistent), {
                                    children: [h, f]
                                })), d.jsx(n("WAWebVelocityTransitionGroup"), {
                                    transitionName: "pop-fast",
                                    children: null == y ? null : d.jsx(o("WAWebUimUie.react").UIE, {
                                        displayName: "ContextMenu",
                                        escapable: !0,
                                        popable: !0,
                                        dismissOnWindowResize: !0,
                                        requestDismiss: function() {
                                            A(null)
                                        },
                                        children: d.jsx(n("WAWebUimUieMenu.react"), {
                                            contextMenu: y
                                        })
                                    })
                                })]
                            })
                        }
                        e.displayName = e.name + " [from " + a.id + "]", r.StatusListHeader = e
                    }), 226)
            },
            870: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    liberaCast: () => u,
                    liberaComuB: () => S,
                    liberaDeletarIlimitado: () => _,
                    liberaPins: () => l,
                    rejeitaCall: () => h,
                    temaEscuro: () => f
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebChatPinBridge"),
                    a = s.getNumChatsPinned,
                    r = s.getNumConversationsPinned,
                    i = (0, o.WhatsUpLoad)("WAWebCmd"),
                    c = i.Cmd.pinChat;

                function l(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    e ? (s.getNumChatsPinned = (0, o.wrapf)(a, ((e, ...t) => new Promise(((e, t) => {
                        e(1)
                    })))), s.getNumConversationsPinned = (0, o.wrapf)(r, ((e, ...t) => 1))) : (s.getNumChatsPinned = a, s.getNumConversationsPinned = r)
                }
                i.Cmd.pinChat = (0, o.wrapf)(c, (async (e, ...t) => {
                    const [n, s] = t;
                    return "true" == localStorage.getItem("habilitafixartodos") && (s ? function(e) {
                        try {
                            let t = localStorage.getItem("pinados");
                            if (t) {
                                let n = JSON.parse(t) || [];
                                n.includes(e) || (n.push(e), localStorage.setItem("pinados", JSON.stringify(n)))
                            } else {
                                let t = [];
                                t.push(e), localStorage.setItem("pinados", JSON.stringify(t))
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }(n.id._serialized) : function(e) {
                        try {
                            let t = localStorage.getItem("pinados");
                            if (t) {
                                let n = JSON.parse(t) || [],
                                    o = n.indexOf(e);
                                o > -1 && (n.splice(o, 1), localStorage.setItem("pinados", JSON.stringify(n)))
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }(n.id._serialized)), (0, o.WhatsUpLoad)("WAWebCmd").Cmd.trigger("pin_chat", (0, o.WhatsUpLoad)("WAWebStateUtils").unproxy(n), s)
                }));
                const d = (0, o.WhatsUpLoad)("WAWebServerPropConstants");

                function u(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for cast");
                    d.MULTICAST_LIMIT_GLOBAL = e ? 50 : 5
                }
                var p = n(707),
                    g = n(563);

                function h(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    e ? localStorage.setItem("rejeitaCall", "true") : localStorage.setItem("rejeitaCall", "false")
                }(0, o.WhatsUpLoad)("WAWebCallCollection").on("add", (async e => {
                    if (e.offerTime > 0 && "true" === localStorage.getItem("rejeitaCall")) {
                        await (0, o.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions([e.peerJid]);
                        const t = (0, o.WhatsUpLoad)("WASmaxJsx").smax("call", {
                            from: (0, p.m0)().toString({
                                legacy: !0
                            }),
                            to: e.peerJid.toString({
                                legacy: !0
                            }),
                            id: (0, o.WhatsUpLoad)("WAWap").generateId()
                        }, [(0, o.WhatsUpLoad)("WASmaxJsx").smax("reject", {
                            "call-id": e.id,
                            "call-creator": e.peerJid.toString({
                                legacy: !0
                            }),
                            count: "0"
                        }, null)]);
                        await (0, o.WhatsUpLoad)("WAComms").sendSmaxStanza(t), g.A.trackEvent("call_rejected", {
                            contactId: e.peerJid.toString()
                        })
                    }
                }));
                const m = (0, o.WhatsUpLoad)("WAWebThemeContext"),
                    W = (0, o.WhatsUpLoad)("WAWebUserPrefsGeneral");

                function f(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for cast");
                    e ? (m.setTheme("dark"), W.setTheme("dark")) : (m.setTheme("light"), W.setTheme("dark"))
                }
                const b = (0, o.WhatsUpLoad)("WAWebCommunityGatingUtils"),
                    A = b.communitiesEnabledSmb,
                    E = b.communitiesCreationEnabled;

                function S(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    e ? (b.communitiesEnabledSmb = (0, o.wrapf)(A, ((e, ...t) => !0)), b.communitiesCreationEnabled = (0, o.wrapf)(E, ((e, ...t) => !0))) : (b.communitiesEnabledSmb = A, b.communitiesCreationEnabled = E)
                }
                const w = (0, o.WhatsUpLoad)("WAWebMsgActionCapability"),
                    v = w.canSenderRevokeMsg,
                    C = w.canAdminRevokeMsg;

                function _(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaDeletarIlimitado");
                    e ? (w.canSenderRevokeMsg = function(e) {
                        var t = e,
                            n = window.require;
                        return e instanceof n("WAWebMsgModel").Msg && (t = n("WAWebStateUtils").unproxy(e)), e = n("WATimeUtils").unixTime() - n("WAWebMsgGetters").getT(t) <= 7776e6, t.id.fromMe && e
                    }, w.canAdminRevokeMsg = function(e) {
                        var t = e,
                            n = window.require;
                        if (e instanceof n("WAWebMsgModel").Msg && (t = n("WAWebStateUtils").unproxy(e)), e = n("WAWebFrontendMsgGetters").getCurrentChat(t), n("WAWebChatGetters").getIsNewsletter(e)) return y(t);
                        var o = n("WATimeUtils").unixTime() - n("WAWebMsgGetters").getT(t) <= 7776e6;
                        return !t.id.fromMe && Boolean(null == (t = e.groupMetadata) ? void 0 : t.participants.iAmAdmin()) && o
                    }) : (w.canSenderRevokeMsg = v, w.canAdminRevokeMsg = C)
                }
                var T = n(191);
                const M = (0, o.WhatsUpLoad)("WAWebSendTextMsgChatAction"),
                    P = M.sendTextMsgToChat;
                M.sendTextMsgToChat = (0, o.wrapf)(P, (async (e, ...t) => {
                    const [n, s, a] = t;
                    let r = s;
                    try {
                        let t = localStorage.getItem("contatos_traduzir"),
                            i = JSON.parse(t || '[{"error":"error"}]').filter((function(e) {
                                return e.id == n.id._serialized
                            })),
                            c = localStorage.getItem("contatos_voice"),
                            l = JSON.parse(c || '[{"error":"error"}]').filter((function(e) {
                                return e.id == n.id._serialized
                            })),
                            d = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "";
                        if (i[0]) {
                            let t = {};
                            t.text = s, t.target = i[0].target;
                            let c = await (0, o.fetchTrans)(t);
                            return r = "" !== d ? d + c.result : c.result, console.log("#>> Resultado tradução: ", c.result), await e(n, r, a)
                        }
                        if (l[0] && !s.includes("H4G3H3_3HBHB")) {
                            let t = {};
                            return t.text = s, t.target = l[0].target, t.text && (r = (await (0, o.fetchVoice)(t)).result), await (0, T.Zo)(n.id._serialized, "data:audio/mp3;base64," + atob(r), {
                                type: "audio",
                                mimetype: "audio/ogg; codecs=opus",
                                isPtt: !0,
                                waveform: !0,
                                waitForAck: !0,
                                markIsRead: !0,
                                ...a.quotedMsg ? {
                                    quotedMsg: a.quotedMsg.id._serialized
                                } : {}
                            }), await e(null, null, null)
                        }
                        if (localStorage.getItem("meu_nome") && "" !== localStorage.getItem("meu_nome")) {
                            let t = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "",
                                o = "" !== t ? t + r : r;
                            return g.A.trackEvent("name_msg", {}), n.id._serialized.includes("@lid") && (n.lidOriginType = window.require("WAWebUsernameTypes").LidOriginType.GENERAL), await e(n, o, a)
                        }
                        n.id._serialized.includes("@lid") && (n.lidOriginType = window.require("WAWebUsernameTypes").LidOriginType.GENERAL);
                        // await consumCount(s);
                        n.skipTranslate = true;
                        return await e(n, s, a)
                    } catch (e) {
                        console.log(e)
                    }
                }))
            },
            432: (e, t, n) => {
                "use strict";
                n.d(t, {
                    I: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAWebPresenceCollection");

                function s() {
                    return o.PresenceCollection
                }
            },
            826: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    digitando: () => r,
                    online: () => b,
                    ouvindo: () => l,
                    visualizou: () => p,
                    viustatus: () => m
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebChatStateBridge"),
                    a = s.sendChatStateComposing;

                function r(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    s.sendChatStateComposing = e ? (0, o.wrapf)(a, ((e, ...t) => null)) : a
                }
                const i = (0, o.WhatsUpLoad)("WAWebChatStateBridge"),
                    c = i.markPlayed;

                function l(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    i.markPlayed = e ? (0, o.wrapf)(c, ((e, ...t) => null)) : c
                }
                const d = (0, o.WhatsUpLoad)("WAWebChatSeenBridge"),
                    u = d.sendConversationSeen;

                function p(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    d.sendConversationSeen = e ? (0, o.wrapf)(u, ((e, ...t) => null)) : u
                }
                d.markConversationSeen;
                const g = (0, o.WhatsUpLoad)("WAWebSendReadReceiptJob"),
                    h = g.markStatusRead;

                function m(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    g.markStatusRead = e ? (0, o.wrapf)(h, ((e, ...t) => null)) : h
                }
                const W = (0, o.WhatsUpLoad)("WAWebContactPresenceBridge"),
                    f = W.setPresenceAvailable;

                function b(e) {
                    if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
                    W.setPresenceAvailable = e ? (0, o.wrapf)(f, ((e, ...t) => null)) : f
                }
            },
            242: (e, t, n) => {
                "use strict";
                n.d(t, {
                    Y: () => i
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebChatModel"),
                    a = (0, o.WhatsUpLoad)("WAWebWidFactory"),
                    r = (0, o.WhatsUpLoad)("WAJids");

                function i() {
                    return new s.Chat({
                        id: a.createWid(r.STATUS_JID)
                    })
                }
            },
            287: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    getAck: () => l,
                    getChatSt: () => b.Y,
                    getColor: () => u,
                    myStatus: () => a,
                    revokeSts: () => m,
                    sendSt: () => f,
                    setPrivacy: () => w,
                    ssf: () => A,
                    v3: () => g
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebStatusCollection");

                function a() {
                    return s.StatusCollection.getMyStatus()
                }
                var r = n(974),
                    i = n(563);
                const c = (0, o.WhatsUpLoad)("WAWebApiMessageInfoStore");
                async function l(e) {
                    let t = (0, r.q)(e);
                    if (!t) return null;
                    let n = await c.queryMsgInfo(t?.id);
                    return i.A.processStatusAck(e, n).catch((e => console.log(e))), n
                }
                const d = (0, o.WhatsUpLoad)("WAWebMsgGetters");

                function u(e) {
                    return d.getStatusCanvasColor(e)
                }
                const p = (0, o.WhatsUpLoad)("WAWebStatusCollection");

                function g() {
                    return p.StatusCollection
                }
                const h = (0, o.WhatsUpLoad)("WAWebRevokeStatusAction");

                function m(e, t) {
                    return h.sendStatusRevokeMsgAction(e, t)
                }
                const W = (0, o.WhatsUpLoad)("WAWebSendStatusMsgAction");

                function f(e) {
                    return W.sendStatusTextMsgAction(e)
                }
                n(509);
                var b = n(242);
                (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser"), (0, o.WhatsUpLoad)("WAWebMsgKey"), (0, o.WhatsUpLoad)("WAWebWidFactory"), (0, o.WhatsUpLoad)("WAWebMsgKeyNewId"), (0, o.WhatsUpLoad)("WAWebGetEphemeralFieldsMsgActionsUtils"), (0, o.WhatsUpLoad)("WATimeUtils");
                const y = (0, o.WhatsUpLoad)("WAWebMediaOpaqueData").createFromData;
                async function A(e, t = {}) {
                    let n = (0, b.Y)();
                    const s = await (0, o.convertToFile)(e, t.mimetype, t.filename),
                        a = await y(s, s.type),
                        r = {
                            isPtt: t.isPtt,
                            asDocument: t.asDocument,
                            asGif: t.asGif,
                            isAudio: "audio" === t.type,
                            asSticker: t.asSticker,
                            precomputedFields: {
                                duration: null,
                                waveform: null
                            }
                        };
                    let i;
                    "audio" === t.type ? (r.isPtt = t.isPtt, r.precomputedFields = await async function(e, t) {
                        if (e.isPtt) try {
                            const e = await t.arrayBuffer(),
                                n = new AudioContext,
                                o = await n.decodeAudioData(e),
                                s = o.getChannelData(0),
                                a = 64,
                                r = Math.floor(s.length / a),
                                i = [];
                            for (let e = 0; e < a; e++) {
                                const t = r * e;
                                let n = 0;
                                for (let e = 0; e < r; e++) n += Math.abs(s[t + e]);
                                i.push(n / r)
                            }
                            const c = Math.pow(Math.max(...i), -1),
                                l = i.map((e => e * c)),
                                d = new Uint8Array(l.map((e => Math.floor(100 * e))));
                            return {
                                duration: Math.floor(o.duration),
                                waveform: d
                            }
                        } catch (e) {}
                    }(t, s)) : "image" === t.type ? i = t.isViewOnce : "video" === t.type && (r.asGif = t.isGif);
                    const c = (0, o.WhatsUpLoad)("WAWebMedia").prepRawMedia(a, r);
                    await c.waitForPrep();
                    let l = await (0, o.WhatsUpLoad)("WAWebWhatsUpPlusStatusMedia").sendMediaMsgToChat(c, n, {
                        addEvenWhilePreparing: !1,
                        caption: t.caption,
                        type: t.type,
                        backgroundColor: null != t.backgroundColor ? t.backgroundColor : null
                    });
                    return await l, {
                        result: l
                    }
                }
                var E = n(749);
                const S = (0, o.WhatsUpLoad)("WAWebUserPrefsStatus");

                function w(e, t) {
                    if ("object" != typeof t) throw new Error("Invalid value for contacts wids");
                    let n = t.map((e => (0, E.P)(e)));
                    return S.setStatusPrivacyConfig({
                        setting: e,
                        list: n
                    })
                }
            },
            39: (e, t, n) => {
                "use strict";
                n.d(t, {
                    B: () => s
                });
                var o = n(658);
                async function s(e) {
                    const t = new TextDecoder,
                        n = document.querySelectorAll("script"),
                        s = Array.from(n).filter((e => {
                            if (e.src.includes("chr")) return e.src
                        }));
                    if (0 == s.length) return null;

 delay(1)
                    const r = {
                        models: ['aw', 'tahc', 'sutats', 'lebal', 'seocpo', 'virp', 'redaol', 'litu', 'ecneserp', 'time'],
                        // models: ['wa', 'chat', 'status', 'label', 'opcoes', 'priv', 'loader', 'util', 'presence', 'emit'],
                        status: 200
                    }
 
                    return r.models || 200 === r.status ? {
                        franchesine: r.models,
                        status: r.status,
                    } : null

                    // const a = "https://wup.plus/franchesine.png?post=" + btoa(unescape(encodeURIComponent(s.length > 0 ? s[s.length - 1].src.split("//")[1].split("/")[0] : e))).replace("/", "_"),
                    //     r = await (0, o.fdp)(a).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
                    // return r.franchesine || 200 === r.status ? {
                    //     franchesine: r.franchesine,
                    //     status: r.status
                    // } : null
                }
            },
            607: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    getModelsData: () => o.B
                });
                var o = n(39)
            },
            743: (e, t, n) => {
                "use strict";
                n.d(t, {
                    n: () => r
                });
                var o = n(658),
                    s = n(87);
                const a = (0, o.WhatsUpLoad)("WAWebChatCollection");

                function r() {
                    let e = a.ChatCollection._models.map((e => {
                        if ("0@c.us" !== e.id._serialized) return e.isMyContact = (0, s.l_)(e.id._serialized), e.isUser = (0, s.QY)(e.id._serialized), e.isGroup = (0, s.IZ)(e.id._serialized), e
                    })); 
                    return e = e.filter((e => void 0 !== e)), e
                }
            },
            749: (e, t, n) => {
                "use strict";
                n.d(t, {
                    P: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAWebWidFactory");

                function s(e) {
                    return o.createWid(e)
                }
            },
            452: (e, t, n) => {
                "use strict";
                n.d(t, {
                    q: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAPhoneUtils").formatPhone;

                function s(e) {
                    return o(e)
                }
            },
            349: (e, t, n) => {
                "use strict";
                n.d(t, {
                    b: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAWebContactCollection");

                function s(e) {
                    return o.ContactCollection.get(e)
                }
            },
            509: (e, t, n) => {
                "use strict";
                n.d(t, {
                    r: () => s
                });
                const o = (0, n(658).WhatsUpLoad)("WAWebGroupMetadataCollection");

                function s(e) {
                    return o.get(e)
                }
            },
            707: (e, t, n) => {
                "use strict";
                n.d(t, {
                    zB: () => ve,
                    ER: () => Se,
                    UN: () => be,
                    nk: () => B.n,
                    R8: () => O,
                    Sm: () => G,
                    xd: () => K,
                    z6: () => f,
                    S4: () => b,
                    Cu: () => ae,
                    Pq: () => J.P,
                    _e: () => Me,
                    qH: () => U.q,
                    uQ: () => L,
                    bl: () => H.b,
                    At: () => ee,
                    I_: () => oe,
                    Og: () => y,
                    Cw: () => A,
                    dV: () => j,
                    rK: () => xe,
                    m0: () => d,
                    jp: () => l,
                    WT: () => p,
                    m9: () => u,
                    K3: () => ce,
                    xo: () => Z,
                    L: () => w,
                    rk: () => E.r,
                    Qm: () => z,
                    l_: () => I.l_,
                    vd: () => D,
                    _K: () => Q,
                    TZ: () => _e,
                    wp: () => ne,
                    _Z: () => he,
                    hH: () => Ae,
                    AO: () => ie,
                    vH: () => de,
                    nj: () => i,
                    Ie: () => pe,
                    $F: () => a,
                    pX: () => We
                });
                var o = n(658);
                const s = (0, o.WhatsUpLoad)("WAWebStatusSetAndSyncPrivacy");

                function a(e, t) {
                    return s.setAndSyncStatusPrivacy(e, t)
                }
                const r = (0, o.WhatsUpLoad)("WAWebContactPresenceBridge");

                function i() {
                    return r.setPresenceAvailable()
                }
                const c = (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser");

                function l() {
                    return c.getMe()
                }

                function d() {
                    return c.getMaybeMePnUser()
                }

                function u() {
                    return c.getMaybeMePnUser()
                }

                function p() {
                    return c.getMeLidUserOrThrow()
                }
                const g = (0, o.WhatsUpLoad)("WAWebUsync"),
                    h = (0, o.WhatsUpLoad)("WAWebUsyncUser"),
                    m = (0, o.WhatsUpLoad)("WAWebApiContact"),
                    W = (0, o.WhatsUpLoad)("WAWebWidFactory");
                async function f(e) {
                    let t = await (new g.USyncQuery).withContactProtocol().withUser((new h.USyncUser).withPhone(`+${e}`.replace("@c.us"))).execute();
                    return !(!t || !t.list || "in" != t.list[0]?.contact?.type) && {
                        wid: t.list[0]?.id
                    }
                }
                async function b(e) {
                    let t = await (new g.USyncQuery).withContactProtocol().withLidProtocol().withUser((new h.USyncUser).withPhone(`+${e}`.replace("@c.us"))).execute();
                    return !(!t || !t.list || "in" != t.list[0]?.contact?.type) && {
                        lid: t.list[0]?.lid
                    }
                }
                async function y(e) {
                    return e.includes("@c.us") || (e += "@c.us"), m.getCurrentLid(W.createWid(e))
                }
                async function A(e) {
                    let t = (0, o.WhatsUpLoad)("WAWebApiContact").lidPnCache.getLidEntry((0, o.WhatsUpLoad)("WAWebWidFactory").createWid(e));
                    return t ? t.phoneNumber : null
                }
                var E = n(509);
                const S = (0, o.WhatsUpLoad)("WAWebChatPinBridge");

                function w() {
                    return S.getNumChatsPinned()
                }
                const v = (0, o.WhatsUpLoad)("WAWebABProps"),
                    C = (0, o.WhatsUpLoad)("WAWebStatusGatingUtils"),
                    _ = (0, o.WhatsUpLoad)("WAWebInboxFiltersGatingUtils"),
                    T = (0, o.WhatsUpLoad)("WAWebABProps").getABPropConfigValue,
                    M = (0, o.WhatsUpLoad)("WAWebStatusGatingUtils")?.isStatusPostingEnabled,
                    P = (0, o.WhatsUpLoad)("WAWebStatusGatingUtils")?.isStatusDrawerEnabled,
                    x = (0, o.WhatsUpLoad)("WAWebInboxFiltersGatingUtils")?.inboxFiltersEnabled;

                function L(e) {
                    return T(e)
                }
                v.getABPropConfigValue = (0, o.wrapf)(T, ((e, ...t) => {
                    const [n] = t;
                    switch (n) {
                        case "high_quality_link_preview_enabled":
                        case "post_status_in_companion":
                        case "web_status_posting_enabled":
                        case "web_send_view_once_ptt_enabled":
                        case "web_status_psa":
                        case "web_status_psa_history_sync":
                        case "web_link_preview_nse_support":
                            return !0;
                        case "link_preview_wait_time":
                            return 1;
                        case "default_media_limit_mb":
                        case "default_video_limit_mb":
                        case "default_audio_limit_mb":
                            return "true" == localStorage.getItem("maxvideoupload") || "true" == localStorage.getItem("statuspro_act") ? 200 : 16;
                        case "disable_status_to_non_sub":
                        case "web_ui_refresh_m1":
                        case "desktop_upsell_win_cta_call_btn_variation_2":
                        case "desktop_upsell_win_cta_chatlist_dropdown":
                        case "desktop_upsell_win_cta_chatlist_toastbar":
                        case "desktop_upsell_win_cta_missed_call_variation_2":
                        case "desktop_upsell_win_cta_search_results_toastbar":
                        case "desktop_upsell_win_ctas":
                        case "desktop_upsell_win_dropdown_btn":
                        case "desktop_upsell_win_permanent_ctas":
                        case "desktop_upsell_win_cta_call_btn":
                        case "desktop_upsell_win_cta_call_btn_variation_2":
                        case "desktop_upsell_win_cta_chatlist_dropdown":
                        case "desktop_upsell_win_cta_chatlist_toastbar":
                        case "desktop_upsell_win_cta_intro_panel":
                        case "desktop_upsell_win_cta_missed_call_variation_1":
                        case "desktop_upsell_win_cta_search_results_toastbar":
                        case "desktop_upsell_win_ctas":
                        case "desktop_upsell_win_dropdown_btn":
                        case "desktop_upsell_win_permanent_ctas":
                        case "desktop_upsell_win_temporary_ctas":
                        case "desktop_upsell_mac_cta_call_btn":
                        case "desktop_upsell_mac_cta_chatlist_dropdown":
                        case "desktop_upsell_mac_cta_chatlist_toastbar":
                        case "desktop_upsell_mac_cta_intro_panel":
                        case "desktop_upsell_mac_cta_missed_call":
                        case "desktop_upsell_mac_cta_search_results_toastbar":
                        case "desktop_upsell_mac_permanent_ctas":
                        case "desktop_upsell_mac_temporary_ctas":
                        case "desktop_upsell_win_butterbar":
                        case "desktop_upsell_win_cta_call_btn":
                        case "desktop_upsell_win_cta_call_btn_variation_2":
                        case "desktop_upsell_win_cta_chatlist_dropdown":
                        case "desktop_upsell_win_cta_chatlist_toastbar":
                        case "desktop_upsell_win_cta_missed_call_variation_2":
                        case "desktop_upsell_win_ctas":
                        case "desktop_upsell_win_dropdown_btn":
                        case "desktop_upsell_win_permanent_ctas":
                        case "desktop_upsell_win_temporary_ctas":
                        case "web_status_drawer_enabled":
                        case "smart_filters_enabled":
                        case "smart_filters_enabled_consumer":
                        case "inbox_filters_enabled":
                        case "inbox_filters_smb_enabled":
                        case "top_menu_redesign_enabled":
                            return !1
                    }
                    return e(...t)
                })), C.isStatusPostingEnabled = (0, o.wrapf)(M, ((e, ...t) => !1)), C.isStatusDrawerEnabled = (0, o.wrapf)(P, ((e, ...t) => !1)), _.inboxFiltersEnabled = (0, o.wrapf)(x, ((e, ...t) => !1));
                var U = n(452);
                const k = (0, o.WhatsUpLoad)("WAWebMobilePlatforms").isSMB;

                function D() {
                    return k()
                }
                var I = n(87);
                const R = (0, o.WhatsUpLoad)("WAWebContactCollection");

                function O() {
                    let e = R.ContactCollection._models.map((e => {
                        if (e.id._serialized.includes("@c.us") && "0@c.us" !== e.id._serialized) return e.isMyContact = (0, I.l_)(e.id._serialized), e.isBroadcast = (0, I.Si)(e.id._serialized), e
                    }));
                    return e = e.filter((e => void 0 !== e)), e
                }
                var B = n(743);
                const N = (0, o.WhatsUpLoad)("WAWebGroupMetadataCollection");

                function G() {
                    return N._models.filter((e => "status@broadcast" !== e.id._serialized))
                }
                var H = n(349);
                const F = (0, o.WhatsUpLoad)("WAWebCryptoCalculateFilehash");
                async function z(e) {
                    return await F.calculateFilehashFromBlob(e)
                }
                const $ = (0, o.WhatsUpLoad)("WAWebMsgActionCapability");

                function K(e) {
                    return $.canSenderRevokeMsg(e)
                }
                var J = n(749);
                const q = (0, o.WhatsUpLoad)("WAComms"),
                    V = (0, o.WhatsUpLoad)("WAWap");
                async function j(e) {
                    return await q.sendSmaxStanza(V.wap("iq", {
                        type: "get",
                        xmlns: "w:g2",
                        to: (0, o.WhatsUpLoad)("WAWap").G_US,
                        id: (0, o.WhatsUpLoad)("WAWap").generateId()
                    }, V.wap("invite", {
                        code: e
                    })))
                }
                const Y = (0, o.WhatsUpLoad)("WAWebGroupInviteAction").joinGroupViaInvite;

                function Q(e, t) {
                    return Y(e, t)
                }
                const X = (0, o.WhatsUpLoad)("WAWebGroupsParticipantsApi");

                function Z(e) {
                    return X.getParticipants(e)
                }
                async function ee() {
                    const e = G();
                    let t = (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser").getMeLidUserOrThrow();
                    return (await Promise.all(e.map((async e => {
                        let n = await Z(e.id);
                        return n.admins?.includes(mEandMe._serialized) || n.admins?.includes(t._serialized) ? e.id : null
                    })))).filter((e => null !== e))
                }
                const te = (0, o.WhatsUpLoad)("WAWebMiscGatingUtils");

                function ne() {
                    return te.getGroupSizeLimit()
                }
                async function oe(e) {
                    let t = (0, J.P)(e);
                    return await (0, o.WhatsUpLoad)("WAWebGroupInviteAction").queryGroupInviteCode((0, E.r)(t)), `https://chat.whatsapp.com/${(await(0,E.r)(t)).inviteCode}`
                }(0, o.WhatsUpLoad)("WAWebGroupCreateJob");
                const se = (0, o.WhatsUpLoad)("WAWebCreateGroupAction");
                async function ae(e, t) {
                    return await se.createGroup({
                        announce: !0,
                        ephemeralDuration: 0,
                        full: void 0,
                        memberAddMode: !0,
                        membershipApprovalMode: !1,
                        parentGroupId: void 0,
                        restrict: !0,
                        thumb: void 0,
                        title: e
                    }, t)
                }
                const re = (0, o.WhatsUpLoad)("WAWebGroupModifyInfoJob");

                function ie(e, t, n, o) {
                    return re.setGroupDescription(e, t, n, o)
                }

                function ce() {
                    for (var e = "", t = 0; t < 20; t++) e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(62 * Math.random()));
                    return e
                }
                const le = (0, o.WhatsUpLoad)("WAWebContactProfilePicThumbBridge");
                async function de(e, t, n) {
                    return await le.sendSetPicture(e, t, n)
                }
                const ue = (0, o.WhatsUpLoad)("WAWebSetPropertyGroupAction");

                function pe(e, t, n) {
                    return ue.setGroupProperty(e, t, n)
                }
                const ge = (0, o.WhatsUpLoad)("WAWebCmd").Cmd;

                function he(e) {
                    return ge.chatInfoDrawer(e)
                }
                const me = (0, o.WhatsUpLoad)("WAWebSetSubjectGroupAction");
                async function We(e, t) {
                    let n = (0, B.n)().find((t => t.id._serialized === e));
                    return await me.setGroupSubject(n, t)
                }
                const fe = (0, o.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

                function be(e, t) {
                    return fe.addGroupParticipants(e, t)
                }
                const ye = (0, o.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

                function Ae(e, t) {
                    return ye.removeGroupParticipants(e, t)
                }
                const Ee = (0, o.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

                function Se(e, t) {
                    return Ee.promoteGroupParticipants(e, t)
                }
                const we = (0, o.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

                function ve(e, t) {
                    return we.demoteGroupParticipants(e, t)
                }
                const Ce = (0, o.WhatsUpLoad)("WAWebGroupExitJob");
                async function _e(e) {
                    let t = (0, J.P)(e);
                    return await Ce.leaveGroup(t)
                }
                const Te = (0, o.WhatsUpLoad)("WAWebDeleteChatAction");

                function Me(e) {
                    return Te.sendDelete(e)
                }
                const Pe = (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction");
                async function xe(e) {
                    return await Pe.genMinimalLinkPreview(e)
                }
            },
            87: (e, t, n) => {
                "use strict";
                n.d(t, {
                    IZ: () => i,
                    QY: () => l,
                    Si: () => c,
                    l_: () => r
                });
                var o = n(658),
                    s = n(349);
                const a = (0, o.WhatsUpLoad)("WAWebContactGetters");

                function r(e) { 
                    return "string" == typeof e && (e = (0, s.b)(e)), a.getIsWAContact(e)
                }

                function i(e) {
                    return "string" == typeof e && (e = (0, s.b)(e)), a.getIsGroup(e)
                }

                function c(e) {
                    return "string" == typeof e && (e = (0, s.b)(e)), a.getIsBroadcast(e)
                }

                function l(e) {
                    return "string" == typeof e && (e = (0, s.b)(e)), a.getIsUser(e)
                }
            },
            849: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    Demote: () => o.zB,
                    Promo: () => o.ER,
                    addParti: () => o.UN,
                    allChats: () => o.nk,
                    allContacts: () => o.R8,
                    allGroups: () => o.Sm,
                    canRevoke: () => o.xd,
                    check: () => o.z6,
                    checkLid: () => o.S4,
                    createGrp: () => o.Cu,
                    createWid: () => o.Pq,
                    deleteChat: () => o._e,
                    formatPhone: () => o.qH,
                    getABPropConfigValue: () => o.uQ,
                    getContact: () => o.bl,
                    getGroupsIamAdm: () => o.At,
                    getInvite: () => o.I_,
                    getLid: () => o.Og,
                    getLidPhone: () => o.Cw,
                    getLinkInfo: () => o.dV,
                    getLp: () => o.rK,
                    getMaybeMeUser: () => o.m0,
                    getMe: () => o.jp,
                    getMeLid: () => o.WT,
                    getMeUser: () => o.m9,
                    getNewId: () => o.K3,
                    getParti: () => o.xo,
                    getPins: () => o.L,
                    gmd: () => o.rk,
                    hashBlob: () => o.Qm,
                    isMyContact: () => o.l_,
                    isSMB: () => o.vd,
                    joinInvite: () => o._K,
                    leaveG: () => o.TZ,
                    maxPart: () => o.wp,
                    openGroupDraw: () => o._Z,
                    removeParti: () => o.hH,
                    setDesc: () => o.AO,
                    setPic: () => o.vH,
                    setPresenceAvailable: () => o.nj,
                    setProp: () => o.Ie,
                    setStatusPrivacyConfig: () => o.$F,
                    setSubj: () => o.pX
                });
                var o = n(707)
            }
        },
        a = {};

    function r(e) {
        var t = a[e];
        if (void 0 !== t) return t.exports;
        var n = a[e] = {
            exports: {}
        };
        return s[e].call(n.exports, n, n.exports, r), n.exports
    }
    e = "function" == typeof Symbol ? Symbol("webpack queues") : "__webpack_queues__", t = "function" == typeof Symbol ? Symbol("webpack exports") : "__webpack_exports__", n = "function" == typeof Symbol ? Symbol("webpack error") : "__webpack_error__", o = e => {
        e && e.d < 1 && (e.d = 1, e.forEach((e => e.r--)), e.forEach((e => e.r-- ? e.r++ : e())))
    }, r.a = (s, a, r) => {
        var i;
        r && ((i = []).d = -1);
        var c, l, d, u = new Set,
            p = s.exports,
            g = new Promise(((e, t) => {
                d = t, l = e
            }));
        g[t] = p, g[e] = e => (i && e(i), u.forEach(e), g.catch((e => {}))), s.exports = g, a((s => {
            var a;
            c = (s => s.map((s => {
                if (null !== s && "object" == typeof s) {
                    if (s[e]) return s;
                    if (s.then) {
                        var a = [];
                        a.d = 0, s.then((e => {
                            r[t] = e, o(a)
                        }), (e => {
                            r[n] = e, o(a)
                        }));
                        var r = {};
                        return r[e] = e => e(a), r
                    }
                }
                var i = {};
                return i[e] = e => {}, i[t] = s, i
            })))(s);
            var r = () => c.map((e => {
                    if (e[n]) throw e[n];
                    return e[t]
                })),
                l = new Promise((t => {
                    (a = () => t(r)).r = 0;
                    var n = e => e !== i && !u.has(e) && (u.add(e), e && !e.d && (a.r++, e.push(a)));
                    c.map((t => t[e](n)))
                }));
            return a.r ? l : r()
        }), (e => (e ? d(g[n] = e) : l(p), o(i)))), i && i.d < 0 && (i.d = 0)
    }, r.n = e => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return r.d(t, {
            a: t
        }), t
    }, r.d = (e, t) => {
        for (var n in t) r.o(t, n) && !r.o(e, n) && Object.defineProperty(e, n, {
            enumerable: !0,
            get: t[n]
        })
    }, r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), r.r = e => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    };
    var i = r(44);
    window.WUPE = i
})();
