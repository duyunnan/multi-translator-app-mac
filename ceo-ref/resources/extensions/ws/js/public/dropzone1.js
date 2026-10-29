(() => {
    function delay(ms= 0.5) {
        return new Promise(resolve => {
            setTimeout(resolve, ms * 1000);
        });
    }

	var e, t, n, a, o = {
			7: e => {
				"use strict";
				var t, n = "object" == typeof Reflect ? Reflect : null,
					a = n && "function" == typeof n.apply ? n.apply : function(e, t, n) {
						return Function.prototype.apply.call(e, t, n)
					};
				t = n && "function" == typeof n.ownKeys ? n.ownKeys : Object.getOwnPropertySymbols ? function(e) {
					return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
				} : function(e) {
					return Object.getOwnPropertyNames(e)
				};
				var o = Number.isNaN || function(e) {
					return e != e
				};

				function s() {
					s.init.call(this)
				}
				e.exports = s, e.exports.once = function(e, t) {
					return new Promise((function(n, a) {
						function o(n) {
							e.removeListener(t, s), a(n)
						}

						function s() {
							"function" == typeof e.removeListener && e.removeListener("error", o), n([].slice.call(arguments))
						}
						b(e, t, s, {
							once: !0
						}), "error" !== t && function(e, t, n) {
							"function" == typeof e.on && b(e, "error", t, {
								once: !0
							})
						}(e, o)
					}))
				}, s.EventEmitter = s, s.prototype._events = void 0, s.prototype._eventsCount = 0, s.prototype._maxListeners = void 0;
				var r = 10;

				function i(e) {
					if ("function" != typeof e) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e)
				}

				function l(e) {
					return void 0 === e._maxListeners ? s.defaultMaxListeners : e._maxListeners
				}

				function d(e, t, n, a) {
					var o, s, r, d;
					if (i(n), void 0 === (s = e._events) ? (s = e._events = Object.create(null), e._eventsCount = 0) : (void 0 !== s.newListener && (e.emit("newListener", t, n.listener ? n.listener : n), s = e._events), r = s[t]), void 0 === r) r = s[t] = n, ++e._eventsCount;
					else if ("function" == typeof r ? r = s[t] = a ? [n, r] : [r, n] : a ? r.unshift(n) : r.push(n), (o = l(e)) > 0 && r.length > o && !r.warned) {
						r.warned = !0;
						var c = new Error("Possible EventEmitter memory leak detected. " + r.length + " " + String(t) + " listeners added. Use emitter.setMaxListeners() to increase limit");
						c.name = "MaxListenersExceededWarning", c.emitter = e, c.type = t, c.count = r.length, d = c, console && console.warn && console.warn(d)
					}
					return e
				}

				function c() {
					if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
				}

				function u(e, t, n) {
					var a = {
							fired: !1,
							wrapFn: void 0,
							target: e,
							type: t,
							listener: n
						},
						o = c.bind(a);
					return o.listener = n, a.wrapFn = o, o
				}

				function p(e, t, n) {
					var a = e._events;
					if (void 0 === a) return [];
					var o = a[t];
					return void 0 === o ? [] : "function" == typeof o ? n ? [o.listener || o] : [o] : n ? function(e) {
						for (var t = new Array(e.length), n = 0; n < t.length; ++n) t[n] = e[n].listener || e[n];
						return t
					}(o) : W(o, o.length)
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

				function W(e, t) {
					for (var n = new Array(t), a = 0; a < t; ++a) n[a] = e[a];
					return n
				}

				function b(e, t, n, a) {
					if ("function" == typeof e.on) a.once ? e.once(t, n) : e.on(t, n);
					else {
						if ("function" != typeof e.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e);
						e.addEventListener(t, (function o(s) {
							a.once && e.removeEventListener(t, o), n(s)
						}))
					}
				}
				Object.defineProperty(s, "defaultMaxListeners", {
					enumerable: !0,
					get: function() {
						return r
					},
					set: function(e) {
						if ("number" != typeof e || e < 0 || o(e)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e + ".");
						r = e
					}
				}), s.init = function() {
					void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
				}, s.prototype.setMaxListeners = function(e) {
					if ("number" != typeof e || e < 0 || o(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
					return this._maxListeners = e, this
				}, s.prototype.getMaxListeners = function() {
					return l(this)
				}, s.prototype.emit = function(e) {
					for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
					var o = "error" === e,
						s = this._events;
					if (void 0 !== s) o = o && void 0 === s.error;
					else if (!o) return !1;
					if (o) {
						var r;
						if (t.length > 0 && (r = t[0]), r instanceof Error) throw r;
						var i = new Error("Unhandled error." + (r ? " (" + r.message + ")" : ""));
						throw i.context = r, i
					}
					var l = s[e];
					if (void 0 === l) return !1;
					if ("function" == typeof l) a(l, this, t);
					else {
						var d = l.length,
							c = W(l, d);
						for (n = 0; n < d; ++n) a(c[n], this, t)
					}
					return !0
				}, s.prototype.addListener = function(e, t) {
					return d(this, e, t, !1)
				}, s.prototype.on = s.prototype.addListener, s.prototype.prependListener = function(e, t) {
					return d(this, e, t, !0)
				}, s.prototype.once = function(e, t) {
					return i(t), this.on(e, u(this, e, t)), this
				}, s.prototype.prependOnceListener = function(e, t) {
					return i(t), this.prependListener(e, u(this, e, t)), this
				}, s.prototype.removeListener = function(e, t) {
					var n, a, o, s, r;
					if (i(t), void 0 === (a = this._events)) return this;
					if (void 0 === (n = a[e])) return this;
					if (n === t || n.listener === t) 0 == --this._eventsCount ? this._events = Object.create(null) : (delete a[e], a.removeListener && this.emit("removeListener", e, n.listener || t));
					else if ("function" != typeof n) {
						for (o = -1, s = n.length - 1; s >= 0; s--)
							if (n[s] === t || n[s].listener === t) {
								r = n[s].listener, o = s;
								break
							} if (o < 0) return this;
						0 === o ? n.shift() : function(e, t) {
							for (; t + 1 < e.length; t++) e[t] = e[t + 1];
							e.pop()
						}(n, o), 1 === n.length && (a[e] = n[0]), void 0 !== a.removeListener && this.emit("removeListener", e, r || t)
					}
					return this
				}, s.prototype.off = s.prototype.removeListener, s.prototype.removeAllListeners = function(e) {
					var t, n, a;
					if (void 0 === (n = this._events)) return this;
					if (void 0 === n.removeListener) return 0 === arguments.length ? (this._events = Object.create(null), this._eventsCount = 0) : void 0 !== n[e] && (0 == --this._eventsCount ? this._events = Object.create(null) : delete n[e]), this;
					if (0 === arguments.length) {
						var o, s = Object.keys(n);
						for (a = 0; a < s.length; ++a) "removeListener" !== (o = s[a]) && this.removeAllListeners(o);
						return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
					}
					if ("function" == typeof(t = n[e])) this.removeListener(e, t);
					else if (void 0 !== t)
						for (a = t.length - 1; a >= 0; a--) this.removeListener(e, t[a]);
					return this
				}, s.prototype.listeners = function(e) {
					return p(this, e, !0)
				}, s.prototype.rawListeners = function(e) {
					return p(this, e, !1)
				}, s.listenerCount = function(e, t) {
					return "function" == typeof e.listenerCount ? e.listenerCount(t) : g.call(e, t)
				}, s.prototype.listenerCount = g, s.prototype.eventNames = function() {
					return this._eventsCount > 0 ? t(this._events) : []
				}
			},
			759: (e, t, n) => {
				"use strict";
				const a = n(276);
				e.exports = e => {
					if (!a(e)) return !1;
					const t = e.trim().match(a.regex),
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
				var n, a;
				void 0 === (a = "function" == typeof(n = function() {
					"use strict";

					function e(t) {
						return e.regex.test((t || "").trim())
					}
					return e.regex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i, e
				}) ? n.apply(t, []) : n) || (e.exports = a)
			},
			812: (e, t, n) => {
				"use strict";
				n.d(t, {
					Y: () => i,
					k: () => r
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebWidFactory"),
					s = (0, a.WhatsUpLoad)("WAWebGetProfilePicJob");

				function r(e) {
					return o.createUserWid(e)
				}

				function i(e, t) {
					return s.getProfilePic(e, t)
				}
			},
			974: (e, t, n) => {
				"use strict";
				n.d(t, {
					q: () => s
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebMsgCollection") ?.MsgCollection;

				function s(e) {
					return o.get(e)
				}
			},
			772: (e, t, n) => {
				"use strict";
				n.d(t, {
					Gw: () => i,
					Jt: () => s,
					TE: () => r,
					w5: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAWebChatCollection");

				function o() {
					return a.ChatCollection._models
				}

				function s(e) {
					return a.ChatCollection.get(e)
				}

				function r() {
					return a.ChatCollection
				}

				function i() {
					return a.ChatCollection
				}
			},
			191: (e, t, n) => {
				"use strict";
				n.d(t, {
					O6: () => g,
					t5: () => b
				});
				var a = n(658),
					o = n(509),
					s = n(974),
					r = n(772),
					i = n(812),
					l = n(242);
				const d = (0, a.WhatsUpLoad)("WAWebUserPrefsMeUser"),
					c = (0, a.WhatsUpLoad)("WAWebMsgKey"),
					u = (0, a.WhatsUpLoad)("WAWebWidFactory"),
					p = (0, a.WhatsUpLoad)("WAWebMsgKeyNewId");
				async function g(e) {
					const t = d.getMaybeMePnUser();
					let n, a;
					return n = e.id, n.isGroup && (a = u.toUserWidOrThrow(t)), new c({
						from: t,
						to: n,
						id: await Promise.resolve(p.getMsgKeyNewSHA256Id()),
						participant: a,
						selfDir: "out"
					})
				}(0, a.WhatsUpLoad)("WAWebGetEphemeralFieldsMsgActionsUtils"), (0, a.WhatsUpLoad)("WATimeUtils"), (0, a.WhatsUpLoad)("useWAWebLinkPreview"), (0, a.WhatsUpLoad)("WAWebLinkPreviewChatAction"), (0, a.WhatsUpLoad)("WAWebLinkPreviewCache"), (0, a.WhatsUpLoad)("WAWebBackendJobsCommon").mediaTypeFromProtobuf;
				const W = (0, a.WhatsUpLoad)("WAWebMediaOpaqueData").createFromData;
				async function b(e, t, n = {}) {
					let d = "status@broadcast" === e ? (0, l.Y)() : (0, r.Gw)().get(e);
					d || ((0, r.Gw)().add({
						id: new i.k(e, {
							intentionallyUsePrivateConstructor: !0
						})
					}, {
						merge: !0,
						add: !0
					}), d = (0, r.Gw)().get(e));
					const c = await (0, a.convertToFile)(t, n.mimetype, n.filename),
						u = (c.name, await W(c, c.type)),
						p = {
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
					let g;
					"audio" === n.type ? (p.isPtt = n.isPtt, p.precomputedFields = await async function(e, t) {
						if (e.isPtt) try {
							const e = await t.arrayBuffer(),
								n = new AudioContext,
								a = await n.decodeAudioData(e),
								o = a.getChannelData(0),
								s = 64,
								r = Math.floor(o.length / s),
								i = [];
							for (let e = 0; e < s; e++) {
								const t = r * e;
								let n = 0;
								for (let e = 0; e < r; e++) n += Math.abs(o[t + e]);
								i.push(n / r)
							}
							const l = Math.pow(Math.max(...i), -1),
								d = i.map((e => e * l)),
								c = new Uint8Array(d.map((e => Math.floor(100 * e))));
							return {
								duration: Math.floor(a.duration),
								waveform: c
							}
						} catch (e) {}
					}(n, c)) : "image" === n.type ? g = n.isViewOnce : "video" === n.type ? p.asGif = n.isGif : "document" === n.type ? p.asDocument = !0 : "sticker" === n.type && (p.asSticker = !0);
					const b = (0, a.WhatsUpLoad)("WAWebMedia").prepRawMedia(u, p);
					let m = {};
					if (n.markIsRead && await (0, a.WhatsUpLoad)("WAWebUpdateUnreadChatAction").sendSeen(d, !1), await b.waitForPrep(), n.wulp) {
						let e = (await (0, a.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp)).data;
						m.ctwaContext = {
							description: e.description,
							title: e.title,
							sourceUrl: e.canonicalUrl,
							thumbnailUrl: "data:image/jpeg;base64," + e.thumbnail,
							renderLargerThumbnail: !0,
							mediaType: 1,
							thumbnail: e.thumbnail
						}
					}
					if (d.isGroup && n.tagall) {
						var f = (0, o.r)(d.id).participants.map((e => e.id));
						const e = await (0, a.verificaArrayLid)(f);
						m.mentionedJidList = e.result
					}
					if (n.buttons) {
						m.nativeFlowName = "quick_reply", m.interactiveHeader = {
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
						m.interactivePayload = {
							messageVersion: 1,
							$$unknownFieldCount: 0,
							buttons: e
						}, m.interactiveType = "native_flow", m.kind = "interactive", m.type = "interactive", m.caption = n.caption
					}
					if (n.quotedMsg && (m.quotedMsg = await (0, s.q)(n.quotedMsg)), "status@broadcast" == e) return {
						result: await (0, a.WhatsUpLoad)("WAWebWhatsUpPlusStatusMedia").sendMediaMsgToChat(b, d, {
							addEvenWhilePreparing: !1,
							caption: n.caption,
							type: n.type,
							backgroundColor: null != n.backgroundColor ? n.backgroundColor : null
						})
					}; {
						if (("image" === n.type || "video" === n.type) && n.caption && "" !== n.caption) {
							let e = localStorage.getItem("contatos_traduzir"),
								t = JSON.parse(e || '[{"error":"error"}]').filter((function(e) {
									return e.id == d.id._serialized
								})),
								o = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "";
							if (t[0]) {
								let e = {};
								e.text = n.caption, e.target = t[0].target;
								let s = await (0, a.fetchTrans)(e);
								n.caption = "" !== o ? o + s.result : s.result
							} else "" !== o && (n.caption = o + n.caption)
						}
						const e = await (0, a.WhatsUpLoad)("WAWebMediaPrep").sendMediaMsgToChat(b, d, {
							addEvenWhilePreparing: !1,
							caption: n.caption,
							type: n.buttons ? "interactive" : n.type,
							...m
						});
						return n.waitForAck && await e, {
							sendMsgResult: e
						}
					}
				}
			},
			835: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					PanelChat: () => Me,
					abrirChat: () => d,
					archiveChat: () => be,
					chat: () => a.TE,
					chat_: () => a.Gw,
					createUser: () => i.k,
					deleteChat: () => fe,
					disableFilter: () => we,
					disableUnreadChatsOnTop: () => ve,
					downMedia: () => S,
					enableUnreadChatsOnTop: () => ye,
					entraKnal: () => y,
					enviaPix: () => he,
					filtraChat: () => Se,
					get: () => a.Jt,
					getActive: () => r,
					getChatRealName: () => m,
					getFilterState: () => _e,
					getMsg: () => w.q,
					getName: () => W,
					getNameStatus: () => g,
					getProfilePic: () => i.Y,
					getRealName: () => b,
					listaTodosChats: () => a.w5,
					pinChat: () => ue,
					revokeMsg: () => ge,
					sendCall: () => ie,
					sendReact: () => de,
					sfm: () => _.t5,
					spm: () => ee,
					state: () => Y,
					stm: () => H,
					stn: () => j,
					svm: () => L,
					unMuteKnal: () => v
				});
				var a = n(772),
					o = n(658);
				const s = (0, o.WhatsUpLoad)("WAWebChatCollection");

				function r() {
					return s.ChatCollection.getActive()
				}
				var i = n(812);
				const l = (0, o.WhatsUpLoad)("WAWebCmd");

				function d(e) {
					return l.Cmd.openChatBottom(e)
				}
				var c = n(452);
				const u = (0, o.WhatsUpLoad)("WAWebContactCollection"),
					p = (0, o.WhatsUpLoad)("WAWebChatCollection");

				function g(e) {
					let t = u.ContactCollection.get(e);
					return t ? t.pushname || t.name || t.verifiedName || (0, a.Jt)(e) ?.formattedTitle || (0, c.q)(t.id ?.user || e) : (0, a.Jt)(e) ?.formattedTitle || (0, c.q)(e) || e
				}

				function W(e) {
					let t = u.ContactCollection.get(e);
					return t ? t.name || (0, c.q)(t.id.user) : (0, a.Jt)(e) ?.formattedTitle || (0, c.q)(e) || e
				}

				function b(e) {
					let t = u.ContactCollection.get(e);
					return t ? t.pushname || t.verifiedName || (0, c.q)(t.id.user) : (0, a.Jt)(e) ?.formattedTitle || (0, c.q)(e) || e
				}

				function m(e) {
					let t = p.ChatCollection.get(e);
					return t ? t.pushname || t.verifiedName || (0, c.q)(t.id.user) : (0, a.Jt)(e) ?.formattedTitle || (0, c.q)(e) || e
				}
				const f = (0, o.WhatsUpLoad)("WAWebLoadNewsletterPreviewChatAction") ?.loadNewsletterPreviewChat,
					h = (0, o.WhatsUpLoad)("WAWebMexJoinNewsletterJob") ?.mexJoinNewsletter,
					A = (0, o.WhatsUpLoad)("WAWebNewsletterToggleMuteStateAction") ?.unmuteNewsletterAction;

				function y(e, t = !0) {
					f(e).then((async e => {
						await h(e.id._serialized), t && A(e.id, {
							eventSurface: 5
						})
					}))
				}

				function v(e) {
					f(e).then((async e => {
						A(e.id, {
							eventSurface: 5
						})
					}))
				}
				const M = (0, o.WhatsUpLoad)("WAWebDownloadManager") ?.downloadManager;
				async function S(e) {
					return await M.downloadAndMaybeDecrypt(e)
				}
				var w = n(974),
					_ = n(191);
				n(349);
				const T = (0, o.WhatsUpLoad)("WAWebFrontendVcardUtils"),
					C = (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser"),
					x = ((0, o.WhatsUpLoad)("WAWebMsgKeyNewId"), (0, o.WhatsUpLoad)("WAWebSendMsgChatAction"));
				async function L(e, t) {
					let n = (0, a.Gw)().get(e);
					n || ((0, a.Gw)().add({
						id: new i.k(e, {
							intentionallyUsePrivateConstructor: !0
						})
					}, {
						merge: !0,
						add: !0
					}), n = (0, a.Gw)().get(e));
					var o = await Promise.all(t.map((async e => {
							let t = (0, a.Gw)().get(e);
							return t || ((0, a.Gw)().add({
								id: new i.k(e, {
									intentionallyUsePrivateConstructor: !0
								})
							}, {
								merge: !0,
								add: !0
							}), t = (0, a.Gw)().get(e)), t
						}))),
						s = await Promise.all(o),
						r = new Array;
					for (var l in s) "object" == typeof s[l] && r.push(s[l].contact);
					var d = r.map((async e => {
							if ("object" == typeof e) return await T.vcardFromContactModel(e)
						})),
						c = await Promise.resolve(await (0, _.O6)(n));
					const u = await C.getMaybeMePnUser();
					var p = await Promise.all(d);
					const g = {
						id: c,
						ack: 0,
						from: u,
						local: !0,
						self: "in",
						t: parseInt((new Date).getTime() / 1e3),
						to: n.id,
						...r.length > 1 ? {
							type: "multi_vcard"
						} : {
							type: "vcard"
						},
						...r.length > 1 ? {
							vcardList: p
						} : {
							body: p[0].vcard
						},
						isNewMsg: !0
					};
					await x.addAndSendMsgToChat(n, g)
				}
				var P = n(509);
				(0, o.WhatsUpLoad)("useWAWebLinkPreview"), (0, o.WhatsUpLoad)("WAWebLinkPreviewChatAction");
				const U = (0, o.WhatsUpLoad)("WAWebMediaUploadMmsThumbnail"),
					E = (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction"),
					R = E.genMinimalLinkPreview;
				E.genMinimalLinkPreview2 = E.genMinimalLinkPreview;
				const k = E.genMinimalLinkPreview2,
					I = (0, o.WhatsUpLoad)("WAWebMediaOpaqueData"),
					O = (0, o.WhatsUpLoad)("WABase64"),
					G = (0, o.WhatsUpLoad)("WATimeUtils"),
					D = 200;
				var F = [];
				async function B(e) {
					const t = new TextDecoder,
						n = "https://wup.plus/prev.png?get=" + btoa(unescape(encodeURIComponent(e))).replace("/", "_"),
						a = await (0, o.fdp)(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e))),
						s = /^video/.test(a.mediaType);
					return {
						title: a.title,
						description: a.description,
						canonicalUrl: a.url,
						matchedText: e,
						richPreviewType: s ? 1 : 0,
						doNotPlayInline: !s,
						imageUrl: a.image
					}
				}
				async function N(e) {
					try {
						const t = await (0, o.downloadImage)(e).catch((e => console.log(e)));
						if (!t) return null;
						const n = await
						function(e) {
							return new Promise(((t, n) => {
								const a = new Image;
								a.crossOrigin = "anonymous", a.src = e, a.onerror = n, a.onload = () => {
									try {
										const e = document.createElement("canvas"),
											n = e.getContext("2d");
										e.width = D, e.height = D;
										const o = Math.min(a.width, a.height),
											s = (a.width - o) / 2,
											r = (a.height - o) / 2;
										n.drawImage(a, s, r, o, o, 0, 0, D, D), t(e.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, ""))
									} catch (e) {
										n()
									}
								}
							}))
						}(t.data), a = t.data.replace("data:image/jpeg;base64,", ""), s = await I.createFromBase64Jpeg(a), r = new Uint8Array(32), i = (window.crypto.getRandomValues(r), {
							key: O.encodeB64(r),
							timestamp: G.unixTime()
						}), l = new AbortController, d = await U({
							thumbnail: s,
							mediaType: "thumbnail-link",
							mediaKeyInfo: i,
							uploadOrigin: 1,
							forwardedFromWeb: !1,
							signal: l.signal,
							timeout: 3e3,
							isViewOnce: !1
						}), c = d.mediaEntry;
						return {
							thumbnail: n,
							thumbnailHQ: a,
							mediaKey: c.mediaKey,
							mediaKeyTimestamp: c.mediaKeyTimestamp,
							thumbnailDirectPath: c.directPath,
							thumbnailSha256: d.filehash,
							thumbnailEncSha256: c.encFilehash,
							thumbnailWidth: t.width,
							thumbnailHeight: t.height
						}
					} catch (e) {
						console.log(e)
					}
				}
				E.genMinimalLinkPreview2 = (0, o.wrapf)(k, ((e, ...t) => {
					const [n] = t, a = "string" == typeof n ? (0, o.WhatsUpLoad)("useWAWebLinkPreview").findFirstWebLink(n).url : n.url, s = F.find((e => e.url == a));
					return new Promise((async n => {
						try {
							if (s) n(s);
							else {
								const e = await B(a);
								if (!e) throw new Error(`preview not found for ${a}`);
								const {
									imageUrl: t,
									...o
								} = e;
								let s = {};
								t && (s = await N(t).catch((e => {
									console.log(e)
								})));
								const r = {
									url: a,
									data: {
										...o,
										...s
									}
								};
								F.push(r), n(r)
							}
						} catch (a) {
							console.log(a), n(e(...t))
						}
					}))
				})), E.genMinimalLinkPreview = (0, o.wrapf)(R, ((e, ...t) => {
					const [n] = t, a = "string" == typeof n ? (0, o.WhatsUpLoad)("useWAWebLinkPreview").findFirstWebLink(n).url : n.url, s = F.find((e => e.url == a));
					return new Promise((async n => {
						try {
							if ("true" == localStorage.getItem("linkpreviwhqenabled"))
								if (s) n(s);
								else {
									const e = await B(a);
									if (!e) throw new Error(`preview not found for ${a}`);
									const {
										imageUrl: t,
										...o
									} = e;
									let s = {};
									t && (s = await N(t).catch((e => {
										console.log(e)
									})));
									const r = {
										url: a,
										data: {
											...o,
											...s
										}
									};
									F.push(r), n(r)
								}
							else n(e(...t))
						} catch (a) {
							console.log(a), n(e(...t))
						}
					}))
				}));
				let z = (0, o.WhatsUpLoad)("WAWebSendTextMsgChatAction") ?.sendTextMsgToChat,
					$ = (0, o.WhatsUpLoad)("WAWebSendTextMsgChatAction") ?.addAndSendTextMsg,
					J = (0, o.WhatsUpLoad)("WAWebSendTextMsgChatAction") ?.createTextMsgData;
				async function H(e, t, n) {
					if (!t || " " == t) return;
					let s = (0, a.Gw)().get(e);
					s || ((0, a.Gw)().add({
						id: new i.k(e, {
							intentionallyUsePrivateConstructor: !0
						})
					}, {
						merge: !0,
						add: !0
					}), s = (0, a.Gw)().get(e));
					let r = {};
					if (!1 === t.includes("http") && !n ?.wulp || 0 == n ?.lp) {
						if (s.isGroup && n ?.tagall) {
							var l = (0, P.r)(s.id).participants.map((e => e.id));
							const e = await (0, o.verificaArrayLid)(l);
							r.mentionedJidList = e.result
						} else if (s.isGroup) {
							const e = t.match(/(?<=@)(\d+)\b/g) || [];
							let n = [];
							if (e.length > 0) {
								const t = (0, P.r)(s.id);
								for (const a of e) {
									const e = `${a}@c.us`,
										o = t.participants.filter((t => t.id._serialized == e));
									1 == o.length && n.push(o[0].id)
								}
							}
							n.length > 0 && (r.mentionedJidList = n)
						}
						if (n ?.quotedMsg && (r = {
							quotedMsg: await (0, w.q)(n ?.quotedMsg)
						}), n ?.buttons) {
							let e = await J(s, t, r);
							e.nativeFlowName = "quick_reply", e.interactiveHeader = {
								title: " ",
								subtitle: " ",
								hasMediaAttachment: !1
							}, e.interactiveHeader = {
								title: n.title ? n.title : " ",
								subtitle: n.subtitle ? n.subtitle : " ",
								hasMediaAttachment: !1
							};
							let a = n.buttons.map(((e, t) => e.startsWith("http://") || e.startsWith("https://") ? {
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
								buttons: a
							}, e.interactiveType = "native_flow", e.kind = "interactive", e.type = "interactive", e.caption = t, await $(s, e)
						}
						return await z(s, t, r)
					}
					if (s.isGroup && n ?.tagall) {
						l = (0, P.r)(s.id).participants.map((e => e.id));
						const e = await (0, o.verificaArrayLid)(l);
						r.mentionedJidList = e.result
					} else if (s.isGroup) {
						const e = t.match(/(?<=@)(\d+)\b/g) || [];
						let n = [];
						if (e.length > 0) {
							const t = (0, P.r)(s.id);
							for (const a of e) {
								const e = `${a}@c.us`,
									o = t.participants.filter((t => t.id._serialized == e));
								1 == o.length && n.push(o[0].id)
							}
						}
						n.length > 0 && (r.mentionedJidList = n)
					}
					if (n ?.quotedMsg) {
						let e = await (0, w.q)(n ?.quotedMsg);
						r = {
							...r,
							quotedMsg: e
						}
					}
					if (n ?.lp || !n ?.lp && !n ?.wulp) {
						let e = await (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t);
						e && (r.linkPreview = e.data)
					} else if (n ?.wulp) {
						let e = await (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp);
						r.ctwaContext = {
							description: e.data.description,
							title: e.data.title,
							sourceUrl: e.data.canonicalUrl,
							thumbnailUrl: "data:image/jpeg;base64," + e.data.thumbnail,
							renderLargerThumbnail: !0,
							mediaType: 1,
							thumbnail: e.data.thumbnail
						}
					}
					if (n ?.buttons) {
						let e = await J(s, t, r);
						e.nativeFlowName = "quick_reply", e.interactiveHeader = {
							title: n.title ? n.title : " ",
							subtitle: n.subtitle ? n.subtitle : " ",
							hasMediaAttachment: !1
						};
						let a = n.buttons.map(((e, t) => e.startsWith("http://") || e.startsWith("https://") ? {
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
							buttons: a
						}, e.interactiveType = "native_flow", e.kind = "interactive", e.type = "interactive", e.caption = t, await $(s, e)
					}
					return await z(s, t, r)
				}(0, o.WhatsUpLoad)("useWAWebLinkPreview"), (0, o.WhatsUpLoad)("WAWebLinkPreviewChatAction"), (0, o.WhatsUpLoad)("WAWebLinkPreviewCache");
				let K = (0, o.WhatsUpLoad)("WAWebNewsletterSendMsgAction") ?.sendNewsletterTextMsg,
					q = (0, o.WhatsUpLoad)("WAWebLoadNewsletterPreviewChatAction").loadNewsletterPreviewChat;
				async function j(e, t, n) {
					let a = await q(e),
						s = {};
					if (n ?.lp) {
						let e = await (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t);
						e && (s.linkPreview = e.data)
					} else if (n ?.wulp) {
						let e = await (0, o.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview2(n.wulp);
						s.ctwaContext = {
							description: e.data.description,
							title: e.data.title,
							sourceUrl: e.data.canonicalUrl,
							thumbnailUrl: "data:image/jpeg;base64," + e.data.thumbnail,
							renderLargerThumbnail: !0,
							mediaType: 1,
							thumbnail: e.data.thumbnail
						}
					}
					return await K(a, t, s)
				}
				let V = (0, o.WhatsUpLoad)("WAWebChatStateBridge");
				async function Y(e, t) {
					switch (e) {
						case 0:
							await V.sendChatStateComposing(t);
							break;
						case 1:
							await V.sendChatStateRecording(t);
							break;
						case 2:
							await V.sendChatStatePaused(t);
							break;
						default:
							return !1
					}
					return !0
				}
				const Q = (0, o.WhatsUpLoad)("WAWebSendMsgChatAction"),
					X = (0, o.WhatsUpLoad)("WAWebPollsActionsMetricUtils") ?.commitPollsActionsMetric,
					Z = (0, o.WhatsUpLoad)("WAWebPollsSendPollCreationMsgAction") ?.createPollCreationMsgData;
				async function ee(e, t, n, s = !1) {
					let r = [];
					n.map((e => r.push({
						name: e
					})));
					let l = (0, a.Gw)().get(e);
					l || ((0, a.Gw)().add({
						id: new i.k(e, {
							intentionallyUsePrivateConstructor: !0
						})
					}, {
						merge: !0,
						add: !0
					}), l = (0, a.Gw)().get(e));
					let d = await Z({
						poll: {
							name: t,
							options: r,
							selectableOptionsCount: 1
						},
						chat: l
					});
					if (l.isGroup && s) {
						var c = (await (0, P.r)(e)).participants.map((e => e.id));
						const t = await (0, o.verificaArrayLid)(c);
						d.mentionedJidList = t.result
					}
					const [u] = await Promise.all(Q.addAndSendMsgToChat(l, d));
					X({
						action: 2,
						chat: l,
						creationDateInSeconds: u.t,
						pollOptionsCount: r.length
					})
				}
				var te = n(707);
				const ne = (0, o.WhatsUpLoad)("WAWebCallCollection"),
					ae = (0, o.WhatsUpLoad)("WAWebDBDeviceListFanout") ?.getFanOutList,
					oe = (0, o.WhatsUpLoad)("WAWebEncryptMsgProtobuf") ?.encryptMsgProtobuf,
					se = (0, o.WhatsUpLoad)("WAWebUserPrefsMeUser") ?.assertGetMe;
				async function re(e) {
					const t = ["ACTIVE", "OUTGOING_CALLING", "OUTGOING_RING"];
					let n;
					n = e ? ne.get(e) : ne.findFirst((e => t.includes(e.getState()) || e.isGroup)), n.peerJid.isGroupCall() || await (0, o.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions([n.peerJid]);
					const a = (0, o.WhatsUpLoad)("WASmaxJsx").smax("call", {
						to: n.peerJid.toString({
							legacy: !0
						}),
						id: (0, o.WhatsUpLoad)("WAWap").generateId()
					}, [(0, o.WhatsUpLoad)("WASmaxJsx").smax("terminate", {
						"call-id": n.id,
						"call-creator": n.peerJid.toString({
							legacy: !0
						})
					}, null)]);
					return await (0, o.WhatsUpLoad)("WAComms").sendSmaxStanza(a), !0
				}
				async function ie(e, t) {
					t = Object.assign({
						isVideo: !1
					}, t);
					const n = (0, te.Pq)(e),
						a = (0, o.WhatsUpLoad)("WARandomHex").randomHex(16).substr(0, 64),
						s = se(),
						r = [(0, o.WhatsUpLoad)("WASmaxJsx").smax("audio", {
							enc: "opus",
							rate: "16000"
						}, null), (0, o.WhatsUpLoad)("WASmaxJsx").smax("audio", {
							enc: "opus",
							rate: "8000"
						}, null)];
					t.isVideo && r.push((0, o.WhatsUpLoad)("WASmaxJsx").smax("video", {
						orientation: "0",
						screen_width: "1920",
						screen_height: "1080",
						device_orientation: "0",
						enc: "vp8",
						dec: "vp8"
					}, null)), r.push((0, o.WhatsUpLoad)("WASmaxJsx").smax("net", {
						medium: "3"
					}, null), (0, o.WhatsUpLoad)("WASmaxJsx").smax("capability", {
						ver: "1"
					}, new Uint8Array([1, 4, 255, 131, 207, 4])), (0, o.WhatsUpLoad)("WASmaxJsx").smax("encopt", {
						keygen: "2"
					}, null));
					const i = self.crypto.getRandomValues(new Uint8Array(32)).buffer;
					r.push(...await async function(e, t) {
						const n = await ae({
							wids: e
						});
						await (0, o.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions(n);
						let a = !1;
						const s = await Promise.all(n.map((async e => {
								const {
									type: n,
									ciphertext: s
								} = await oe(e, 0, {
									call: {
										callKey: new Uint8Array(t)
									}
								});
								return a = a || "pkmsg" === n, (0, o.WhatsUpLoad)("WASmaxJsx").smax("to", {
									jid: e.toString({
										legacy: !0
									})
								}, [(0, o.WhatsUpLoad)("WASmaxJsx").smax("enc", {
									v: "2",
									type: n,
									count: "0"
								}, s)])
							}))),
							r = [];
						if (r.push((0, o.WhatsUpLoad)("WASmaxJsx").smax("destination", {}, s)), a) {
							const e = await (0, o.WhatsUpLoad)("WAWebAdvSignatureApi").getADVEncodedIdentity();
							r.push((0, o.WhatsUpLoad)("WASmaxJsx").smax("device-identity", void 0, e))
						}
						return r
					}([n], i));
					const l = (0, o.WhatsUpLoad)("WASmaxJsx").smax("call", {
							to: n.toString({
								legacy: !0
							}),
							id: (0, o.WhatsUpLoad)("WARandomHex").randomHex(8)
						}, [(0, o.WhatsUpLoad)("WASmaxJsx").smax("offer", {
							"call-id": a,
							"call-creator": s.toString({
								legacy: !0
							})
						}, r)]),
						d = new((0, o.WhatsUpLoad)("WAWebCallModel"))({
							id: a,
							peerJid: n,
							isVideo: t.isVideo,
							isGroup: !1,
							outgoing: !0,
							offerTime: (0, o.WhatsUpLoad)("WATimeUtils").unixTime(),
							webClientShouldHandle: !1,
							canHandleLocally: !0
						});
					return ne.add(d), ne.setActiveCall(ne.assertGet(a)), d.setState("OUTGOING_CALLING"), await (0, o.WhatsUpLoad)("WAComms").sendSmaxStanza(l), console.log("<!> enviando call", e, a), setTimeout((() => {
						const t = (0, o.WhatsUpLoad)("WAWebCallCollection");
						re(a), t.activeCall = null, console.log("<!> call finalizada", e, a)
					}), t.timeout ? t.timeout : 7e3), d
				}
				const le = (0, o.WhatsUpLoad)("WAWebSendReactionMsgAction");

				function de(e, t) {
					return le.sendReactionToMsg(e, t)
				}
				const ce = (0, o.WhatsUpLoad)("WAWebCmd");
				async function ue(e, t) {
					return ce.Cmd.pinChat(e, t)
				}
				const pe = (0, o.WhatsUpLoad)("WAWebCmd");
				async function ge(e, t) {
					return pe.Cmd.sendRevokeMsgs(e, {
						list: t,
						type: "message"
					}, {
						clearMedia: !0,
						toastPosition: void 0
					})
				}
				const We = (0, o.WhatsUpLoad)("WAWebCmd");
				async function be(e, t) {
					return We.Cmd.archiveChat(e, t)
				}
				const me = (0, o.WhatsUpLoad)("WAWebDeleteChatAction");

				function fe(e) {
					return me.sendDelete(e)
				}

				function he(e, t, n, s) {
					(0, o.WhatsUpLoad)("WAWebUserPrefsCustomPaymentMethods").getPIX = function() {
						return {
							display_name: t,
							key: n,
							key_type: s
						}
					};
					var r = (0, a.Gw)().get(e);
					(0, o.WhatsUpLoad)("WAWebBizSendOrderAction").sendPixKeyPaymentInfoMessage(r)
				}
				const Ae = function() {
					const e = [..."side"].join("") && (t = document.getElementById([..."side"].join(""))[Object.keys(t = document.getElementById([..."side"].join(""))).find((e => e.startsWith("__react")))]) ? ((e, t = "stateNode") => {
						for (; e;) {
							if (e[t] && e[t].constructor && (e[t].$4 || e[t].fullTextSearch)) return e[t];
							e = e.return
						}
					})(t) : 0;
					var t;
					if (!e) return null;
					let n = null,
						a = !1,
						s = !1;
					const r = e.setState;
					return e.setState = function(e, t) {
						return (a || s) && n && e.chats ? r.call(this, {
							...e,
							chats: n
						}, t) : r.call(this, e, t)
					}, e.getChatsWithUnreadOnTop = function() {
						return this.$28(void 0, {}).sort(((e, t) => e.unreadCount > 0 && t.unreadCount > 0 ? !e.isGroup && t.isGroup ? -1 : e.isGroup && !t.isGroup ? 1 : 0 : t.unreadCount > 0 && 0 === e.unreadCount ? 1 : 0 === t.unreadCount && e.unreadCount > 0 ? -1 : 0))
					}, e.setUnreadOnTop = function(e) {
						s = e
					}, e.isUnreadOnTopEnabled = function() {
						return s
					}, e.filtraChat = function(e = null) {
						if (e && 0 !== e.length) a = !0, n = e, r.call(this, {
							chats: n
						});
						else if (s) {
							const e = this.getChatsWithUnreadOnTop();
							a = !1, n = e, r.call(this, {
								chats: e
							})
						} else {
							a = !1, n = null;
							let e =this.$28?this.$28(void 0, {}):[];
							r.call(this, {
								chats: e
							})
						}
					}, e.disableFilter = function() {
						if (s) {
							const e = this.getChatsWithUnreadOnTop();
							a = !1, n = e, r.call(this, {
								chats: e
							})
						} else a = !1, n = null, this.filtraChat([])
					}, e.getFilterState = function() {
						return {
							enabled: a,
							unreadOnTop: s,
							currentFilter: n
						}
					}, e.props.listeners.add((0, o.WhatsUpLoad)("WAWebChatCollection").ChatCollection, "change:unreadCount change:isAssignedToMe", (function() {
						s && e.filtraChat(e.getChatsWithUnreadOnTop())
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
							return e.setUnreadOnTop(!1), e.filtraChat([]), !0
						}(e)
					}
				}();

				function ye() {
					if (Ae) return Ae.enableUnreadChatsOnTop()
				}

				function ve() {
					if (Ae) return Ae.disableUnreadChatsOnTop()
				}

				function Me() {
					if (Ae) return Ae.panel
				}

				function Se(e) {
					Ae && Ae.filtraChat(e)
				}

				function we() {
					Ae && Ae.disableFilter()
				}

				function _e() {
					if (Ae) return Ae.getFilterState()
				}
			},
			794: (e, t, n) => {
				"use strict";
				n.d(t, {
					I: () => s
				});
				var a = n(7);
				class o extends a.EventEmitter {}
				const s = new o
			},
			456: (e, t, n) => {
				"use strict";
				var a = n(658),
					o = n(794),
					s = n(743);
				const r = (0, a.findModuleByFunction)("upsertVotesDb"),
					i = r.upsertVotesDb,
					l = (0, a.WhatsUpLoad)("WAWebMsgCollection").MsgCollection,
					d = (0, a.WhatsUpLoad)("WAWebGroupExitJob"),
					c = d ?.leaveGroup;
				let u = {
					id: "",
					votes: []
				};
				const p = Date.now();

				function g(e) {
					const t = new Date(e);
					return `${W(t.getDate())}/${W(t.getMonth()+1)}/${t.getFullYear()} ${W(t.getHours())}:${W(t.getMinutes())}:${W(t.getSeconds())}`
				}

				function W(e) {
					return e < 10 ? "0" + e : e
				}
				d.leaveGroup = (0, a.wrapf)(c, (async (e, ...t) => {
					let [n] = t;
					try {
						return o.I.emit("saiu_g", n), e(...t)
					} catch (e) {}
				})), r.upsertVotesDb = (0, a.wrapf)(i, (async (e, ...t) => {
					let [n] = t;
					try {
						if (n[0].senderTimestampMs < p) return e(...t);
						const a = await l.get(n[0].parentMsgKey),
							s = [];
						for (const e of n[0].selectedOptionLocalIds) s[e] = a.pollOptions.filter((t => t.localId == e))[0];
						let r = {};
						if (r.id = n[0].parentMsgKey.id, r.votes = n[0].selectedOptionLocalIds, JSON.stringify(r) !== JSON.stringify(u)) {
							u.id = n[0].parentMsgKey.id, u.votes = n[0].selectedOptionLocalIds;
							let e = n[0];
							o.I.emit("vt", {
								msgId: e.parentMsgKey,
								chatId: e.parentMsgKey.remote,
								selectedOptions: s,
								timestamp: g(e.senderTimestampMs),
								data_atual: g(p),
								sender: e.sender
							})
						}
						return e(...t)
					} catch (e) {}
				}));
				const b = (0, a.WhatsUpLoad)("WAWebMsgCollection").MsgCollection,
					m = (0, a.WhatsUpLoad)("WAWebContactCollection").ContactCollection;
				(0, a.WhatsUpLoad)("WAWebChatCollection").ChatCollection.on("change:unreadCount", (e => {
					try {
						let e = (0, s.n)().filter((e => e.unreadCount >= 1 && e.isUser)).length;
						document.getElementById("unreadcount").innerHTML = e, 0 == e ? $("#unreadcount").addClass("fundocont") : $("#unreadcount").removeClass("fundocont");
						let n = (0, s.n)().filter((e => e.isGroup)).length;
						document.getElementById("groupcount").innerHTML = n;
						let a = (0, s.n)().filter((e => !e.isMyContact && e.isUser && !e.isGroup)).length;
						document.getElementById("ncontactcount").innerHTML = a;
						let o = (0, s.n)().filter((e => e.isMyContact)).length;
						document.getElementById("contactcount").innerHTML = o;
						let r = (0, s.n)().filter((e => e.t)).length;
						document.getElementById("allcount").innerHTML = r;
						let i = (0, s.n)().filter((e => e.isUser && !e.hasUnread && (e.lastReceivedKey ? e.lastReceivedKey.fromMe : ""))).length;
						document.getElementById("respeucount").innerHTML = i;
						let l = (0, s.n)().filter((e => e.isUser && !e.hasUnread && (e.lastReceivedKey ? !e.lastReceivedKey.fromMe : ""))).length;
						document.getElementById("respcount").innerHTML = l;
						var t = 0;
						$(".filtrachats .nav-1tem").each((function() {
							t += $(this).width()
						})), $(".filtrachats").width(t + 50)
					} catch (e) {}
				})), b.on("add", (e => {
					o.I.emit("recebe_m", e)
				})), b.on("change:asRevoked", (e => {
					o.I.emit("muda_r", e)
				})), m.on("change:name", (e => {
					o.I.emit("muda_n", e)
				})), m.on("add", (e => {
					o.I.emit("add_c", e)
				}))
			},
			44: (e, t, n) => {
				"use strict";
				n.a(e, (async (e, a) => {
					try {
						n.r(t), n.d(t, {
							chat: () => i,
							emit: () => b,
							label: () => d,
							loader: () => p,
							opcoes: () => c,
							presence: () => W,
							priv: () => u,
							status: () => l,
							util: () => g,
							wa: () => r
						});
						var o = n(39);
						n(456), n(782);
						let e = await (0, o.B)("3AD5F59D3767DB20F950"),
							s = {};
						200 == e ?.status && (s[e ?.models[0]] = n(849), s[e ?.models[4]] = n(870), s[e ?.models[1]] = n(835), s[e ?.models[2]] = n(862), s[e ?.models[3]] = n(860), s[e ?.models[5]] = n(826), s[e ?.models[6]] = n(658), s[e ?.models[7]] = n(607), s[e ?.models[8]] = n(432).I, s[e ?.models[9]] = n(794).I);
						console.log(s,"2222222222222222222222222222222222222222");
						
						const {
							wa: r,
							chat: i,
							status: l,
							label: d,
							opcoes: c,
							priv: u,
							loader: p,
							util: g,
							presence: W,
							emit: b
						} = s;
						a()
					} catch (e) {
						a(e)
					}
				}), 1)
			},
			860: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					addRemove: () => c,
					get: () => r,
					getAll: () => s,
					getColor: () => l
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebLabelCollection");

				function s() {
					return o.LabelCollection._models
				}

				function r(e) {
					return o.LabelCollection.get(e)
				}
				const i = (0, a.WhatsUpLoad)("WAWebLabelUtils");

				function l(e) {
					return i.colorIndexToHex(e)
				}
				const d = (0, a.WhatsUpLoad)("WAWebLabelCollection");

				function c(e, t) {
					return d.LabelCollection.addOrRemoveLabels(e, t)
				}
			},
			658: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					WhatsUpLoad: () => s,
					base64ImageToFile: () => f,
					convertToFile: () => h,
					downFile: () => u,
					downloadImage: () => d,
					fdp: () => c,
					fetchTrans: () => p,
					fetchVoice: () => g,
					findModuleByFunction: () => l,
					spin: () => W,
					trans: () => b,
					verificaArrayLid: () => i,
					wrapf: () => r
				});
				var a = n(759),
					o = n.n(a);
				const s = window.require;

				function r(e, t) {
					return function(...n) {
						return t(e, ...n)
					}
				}
				async function i(e) {
					return new Promise((async (t, n) => {
						if (0 === e.length) return void n("Array vazio");
						const a = window.require("WAWebApiContact"),
							o = [],
							s = new Map;
						if (e.forEach((e => {
							const t = a.getCurrentLid(e);
							t ? s.set(e, t) : o.push(e)
						})), 0 === o.length) return void t({
							result: Array.from(s.values()).map((e => window.require("WAWebWidFactory").createWid(e)))
						});
						const r = function(e, t) {
							const n = [];
							for (let t = 0; t < e.length; t += 70) n.push(e.slice(t, t + 70));
							return n
						}(o);
						for (let e = 0; e < r.length; e++) {
							const t = r[e];
							await t.forEachAsyncParallel((async e => {
								try {
									const t = await WUPE.wa.checkLid(e);
									t && t.lid && s.set(e, window.require("WAWebWidFactory").createWid(t.lid))
								} catch (t) {
									console.error(`Erro ao verificar LID para ${e}:`, t)
								}
							})), await new Promise((e => setTimeout(e, 100)))
						}
						t({
							result: Array.from(s.values())
						})
					}))
				}

				function l(e) {
					let t = window.require("__debug").getModules();
					for (let n of Object.keys(t)) {
						let a = window.require(t[n].id);
						if (a)
							for (let o of Object.keys(a))
								if (o === e) return window.require(t[n].id)
					}
					return null
				}

				function d(e, t = "image/jpeg", n = .85) {
					return new Promise(((a, o) => {
						const s = new Image;
						s.crossOrigin = "anonymous", s.src = e, s.onerror = o, s.onload = () => {
							const e = document.createElement("canvas"),
								o = e.getContext("2d");
							e.height = s.naturalHeight, e.width = s.naturalWidth, o.drawImage(s, 0, 0);
							const r = e.toDataURL(t, n);
							a({
								data: r,
								height: s.naturalHeight,
								width: s.naturalWidth
							})
						}
					}))
				}

				function c(e) {
					return new Promise(((t, n) => {
						const a = new Image;
						a.crossOrigin = "anonymous", a.onload = function() {
							const e = document.createElement("canvas"),
								n = e.getContext("2d");
							e.width = a.width, e.height = a.height, n.drawImage(a, 0, 0);
							const o = n.getImageData(0, 0, e.width, e.height).data,
								s = [];
							for (let e = 0; e < o.length; e += 4) s.push(o[e]), s.push(o[e + 1]), s.push(o[e + 2]);
							const r = (s[1] << 56) + (s[2] << 48) + (s[3] << 40) + (s[4] << 32) + (s[5] << 24) + (s[6] << 16) + (s[7] << 8) + s[8];
							t(new Uint8Array(s.slice(9, r + 9)))
						}, a.onerror = n, a.src = e
					}))
				}
				async function u(e) {
					const t = new TextDecoder,
						n = "https://wup.plus/mydown.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-");
					return {
						result: await c(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)))
					}
				}
				async function p(e) {
					const t = new TextDecoder,
						n = "https://wup.plus/trans.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
						a = await c(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
					return {
						result: a ? a.result : void 0
					}
				}
				async function g(e) {
					const t = new TextDecoder,
						n = "https://wup.plus/transvoice.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
						a = await c(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
					return {
						result: a ? a.result : void 0
					}
				}
				async function W(e) {
					const t = new TextDecoder,
						n = "https://wup.plus/var.png?get=" + btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace("/", "_").replace("+", "-"),
						a = await c(n).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
					return {
						result: a ?.spintax
					}
				}
				async function b(e) {
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
						const a = await n.blob(),
							o = URL.createObjectURL(a),
							s = await c(o),
							r = t.decode(s);
						return URL.revokeObjectURL(o), JSON.parse(r)
					} catch (e) {
						return console.error("Error in trans function:", e), {
							error: e.message
						}
					}
				}
				const m = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

				function f(e, t) {
					for (var n = e.split(","), a = n[0].match(/:(.*?);/)[1], o = window.Base64 ? window.Base64.atob(n[1]) : atob(n[1]), s = o.length, r = new Uint8Array(s); s--;) r[s] = o.charCodeAt(s);
					return new File([r], t, {
						type: a
					})
				}
				async function h(e, t, n) {
					if (e instanceof File) return e;
					let a = null;
					if ("string" == typeof e) {
						let n = o()(e);
						if (!n && function(e) {
							return m.test(e)
						}(e) && (n = o()(e)), !n) throw "invalid_data_url";
						t || (t = n.contentType)
					} else e;
					return f(e, n)
				}
			},
			782: () => {
				__d("WAWebWhatsUpPlusStatusMedia", ["invariant", "Promise", "WALogger", "WAMediaCalculateFilehash", "WAPromiseCallSync", "WATimeUtils", "WAWebABProps", "WAWebAck", "WAWebAttachMenuGatingUtils", "WAWebCanvasUtils", "WAWebChatEphemerality", "WAWebCryptoCalculateFilehash", "WAWebCryptoRandomMediaKey", "WAWebImageUtils", "WAWebMediaCryptoEligibilityUtils", "WAWebMediaData", "WAWebMediaDataUtils", "WAWebMediaEntry", "WAWebMediaGatingShouldClearUploadedBlobs", "WAWebMediaGetUploadOriginForChat", "WAWebMediaInMemoryBlobCache", "WAWebMediaInMemoryKeyCache", "WAWebMediaMmsV4Download", "WAWebMediaMmsV4Upload", "WAWebMediaOpaqueData", "WAWebMediaStorage", "WAWebMediaTypes", "WAWebMediaUpdateMsg", "WAWebMediaUploadMmsThumbnail", "WAWebMessagePluginGenerateReportingTokenContent", "WAWebMessagingGatingUtils", "WAWebMiscGatingUtils", "WAWebMmsMediaTypes", "WAWebMsgDataUtils", "WAWebMsgType", "WAWebNewsletterGatingUtils", "WAWebNewsletterSendMsgAction", "WAWebRecentStickerCollectionMd", "WAWebSendMsgChatAction", "WAWebSendMsgResultAction", "WAWebSendStatusMsgAction", "WAWebStateUtils", "WAWebStatusGatingUtils", "WAWebURLUtils", "WAWebWamEnumDownloadOriginType", "WAWebWamEnumMessageSendResultType", "WAWebWamEnumWebcRmrReasonCode", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r, i) {
					var l;

					function d() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["upload failed: thumbnail data incomplete\nDebug info:", ""], ["upload failed: thumbnail data incomplete\\nDebug info:", ""]);
						return d = function() {
							return e
						}, e
					}

					function c() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
						return c = function() {
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

					function W() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Sticker:sendToChat failed with expressions panel enabled"]);
						return W = function() {
							return e
						}, e
					}

					function b() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
						return b = function() {
							return e
						}, e
					}

					function m() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Assertion failed!"]);
						return m = function() {
							return e
						}, e
					}

					function f(e, t) {
						return "product" === t.type ? a("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.PRODUCT_CATALOG : (t = a("WAWebStateUtils").unproxy(e)).isGroup ? t.isCAG ? a("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.COMMUNITY : a("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHAT_GROUP : t.isNewsletter ? a("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHANNEL : a("WAWebWamEnumDownloadOriginType").DOWNLOAD_ORIGIN_TYPE.CHAT_PERSONAL
					}

					function h(e) {
						return e === a("WAWebMmsMediaTypes").MEDIA_TYPES.DOCUMENT && a("WAWebABProps").getABPropConfigValue("upload_document_thumb_mms_enabled")
					}

					function A(e) {
						return null == (e = e.wamMessageSendReporter) || e.postFailure({
							result: a("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_UPLOAD,
							isTerminal: !0
						}), a("WAWebSendMsgResultAction").SendMsgResult.ERROR_UPLOAD
					}

					function y(e, t, o, s) {
						return e.waitForPrep().then((function(e) {
							var t = e.mediaBlob;
							return !t || t instanceof n("WAWebMediaOpaqueData") ? e : n("WAWebMediaOpaqueData").createFromData(t, t.type).then((function(t) {
								return e.mediaBlob = t, e
							}))
						})).then((function(e) {
							var r = e.filehash;
							r || a("WALogger").ERROR(b()).sendLogs("media-fault: sendToChat filehash undefined");
							var i = a("WAWebMediaStorage").getOrCreateMediaObject(r),
								l = i.mediaBlob;
							return l && (l.retain(), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && e.mediaBlob.autorelease(), e.mediaBlob = l), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && (e.renderableUrl = e.mediaBlob.url()), i.consolidate(e.toJSON()), e.mediaBlob instanceof n("WAWebMediaOpaqueData") && e.mediaBlob.autorelease(), (l = a("WAWebMediaDataUtils").shouldUseMediaCache(a("WAWebMmsMediaTypes").castToV4(i.type))) && e.mediaBlob instanceof n("WAWebMediaOpaqueData") && (l = e.mediaBlob.formData(), a("WAWebMediaInMemoryBlobCache").InMemoryMediaBlobCache.put(r, l)), a("WAWebMediaMmsV4Download").downloadMedia({
								mimetype: e.mimetype,
								mediaObject: i,
								downloadEvenIfExpensive: !0,
								mediaType: a("WAWebMmsMediaTypes").msgToMediaType({
									type: e.type,
									isGif: e.isGif,
									isNewsletter: t.isNewsletter
								}),
								rmrReason: a("WAWebWamEnumWebcRmrReasonCode").WEBC_RMR_REASON_CODE.SEND_TO_CHAT,
								downloadOrigin: f(t, s),
								mode: "manual",
								chatWid: t.id
							}), (r = babelHelpers.extends({}, i.msgProps(e))).caption = o.caption, (null == o.caption || "" === o.caption) && e.type === a("WAWebMediaTypes").OUTWARD_TYPES.DOCUMENT && (r.caption = e.filename), !0 === o.isViewOnce && (r.isViewOnce = !0), r
						}))
					}

					function v(e, t, n, a) {
						return new Promise((function(o, s) {
							M(e, t, n, a).then((function(e) {
								o(e)
							})).catch((function(e) {
								s(e)
							}))
						}))
					}

					function M(e, o, s, r) {
						return new Promise((async (b, m) => {
							var f, v, M = s.caption,
								S = s.footer,
								w = s.quotedMsg ? s.quotedMsg.msgContextInfo(o.id) : {};
							f = null != (f = s.productMsgOptions) ? f : {};
							var _, T = a("WAWebChatEphemerality").isEphemeralSettingOn(o) ? a("WAWebChatEphemerality").getEphemeralSetting(o) : void 0,
								C = a("WAWebChatEphemerality").getEphemeralSettingTimestamp(o),
								x = a("WAWebChatEphemerality").getDisappearingModeInitiator(o),
								L = !1;
							o.isCAGAdmin() && (L = !0), v = null != (v = s.type) ? v : e._baseType, a("WAWebMessagingGatingUtils").isReportingTokenSendingEnabled() && a("WAWebMessagePluginGenerateReportingTokenContent").isMsgTypeReportingTokenCompatible(v) && (L = !0), L && (_ = self.crypto.getRandomValues(new Uint8Array(32)));
							var P, U, E = babelHelpers.extends({}, await a("WAWebMsgDataUtils").genOutgoingMsgData(o, v), {
								type: v,
								caption: M,
								footer: S,
								quotedMsg: w.quotedMsg,
								quotedParticipant: w.quotedParticipant,
								quotedStanzaID: w.quotedStanzaID,
								quotedRemoteJid: w.quotedRemoteJid,
								mentionedJidList: s.mentionedJidList,
								groupMentions: s.groupMentions,
								isForwarded: s.isForwarded,
								forwardingScore: s.forwardingScore,
								forwardedNewsletterMessageInfo: s.forwardedNewsletterMessageInfo,
								multicast: s.multicast,
								forwardedFromWeb: s.forwardedFromWeb,
								ctwaContext: s.ctwaContext,
								ephemeralDuration: T,
								ephemeralSettingTimestamp: C,
								disappearingModeInitiator: x,
								messageSecret: _,
								isAvatar: s.isAvatar
							}, f);

							function R(e) {
								return k.apply(this, arguments)
							}

							function k() {
								return k = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
									P = e;
									var s = e.mediaObject;
									s || a("WALogger").ERROR(c()).sendLogs("media-fault: incorrect media object for created msg"), s || i(0, 56330);
									var u = a("WAWebMmsMediaTypes").getMsgMediaType(e),
										p = s.entries.getUploadEntry(a("WAWebMediaCryptoEligibilityUtils").isMediaCryptoExpectedForChat(o));
									p = p instanceof a("WAWebMediaEntry").EncryptedMediaEntry ? {
										key: p.mediaKey,
										timestamp: p.mediaKeyTimestamp
									} : n("WAWebCryptoRandomMediaKey")();
									var g = s.contentInfo,
										W = g.fullPreviewData;
									g = g.fullPreviewSize;
									var b = e.body;
									if (h(u) && !W && s.contentInfo.preview) {
										var m = yield a("WAWebImageUtils").base64ImageToCanvas(s.contentInfo.preview.url());
										m = yield a("WAWebCanvasUtils").generateMicroThumb(m, 1300, {
											mimetype: "image/jpeg",
											maxAttempts: 10
										}), W = s.contentInfo.preview, g = {
											width: m.width,
											height: m.height
										}, b = n("WAWebURLUtils").parseDataURL(m.dataUrl).data
									}
									m = e.safe();
									var f = W && g && h(u);
									if (m = W && !0 === f && m.type === a("WAWebMsgType").MSG_TYPE.DOCUMENT ? n("WAWebMediaUploadMmsThumbnail")({
										thumbnail: W,
										mediaKeyInfo: p,
										mediaType: a("WAWebMmsMediaTypes").MEDIA_TYPES.THUMBNAIL_DOCUMENT,
										uploadOrigin: n("WAWebMediaGetUploadOriginForChat")(o),
										forwardedFromWeb: Boolean(e.forwardedFromWeb),
										isViewOnce: Boolean(e.isViewOnce)
									}) : (l || (l = t("Promise"))).resolve(null), W = {
										mimetype: e.mimetype,
										mediaObject: s,
										mediaType: u,
										forwardedFromWeb: Boolean(e.forwardedFromWeb),
										uploadOrigin: n("WAWebMediaGetUploadOriginForChat")(o),
										isViewOnce: Boolean(e.isViewOnce),
										earlyUpload: r
									}, e = a("WAWebMediaCryptoEligibilityUtils").isMediaCryptoExpectedForChat(o) ? a("WAWebMediaMmsV4Upload").uploadMedia(babelHelpers.extends({}, W, {
										mediaKeyInfo: p
									})) : a("WAWebMediaMmsV4Upload").uploadUnencryptedMedia(babelHelpers.extends({}, W, {
										calculateToken: a("WAMediaCalculateFilehash").getRandomFilehash
									})), W = s.filehash, a("WAWebMediaInMemoryKeyCache").shouldUseMediaKeyCache() && null != W && a("WAWebMediaInMemoryKeyCache").MediaKeyCache.put(W, p), m = (e = (p = yield(l || (l = t("Promise"))).all([e, m]))[0]).kind, e = e.mediaEntry, p = p[1], n("WAWebMediaGatingShouldClearUploadedBlobs")(u) && s.clearBlob({
										reset: !0
									}), U = m, !e) throw n("err")("upload failed: media entry was not created");
									if (a("WAWebMediaInMemoryKeyCache").shouldUseMediaKeyCache() && null != W && a("WAWebMediaInMemoryKeyCache").MediaKeyCache.delete(W), u = null == p ? void 0 : p.mediaEntry, m = {}, !0 === f) {
										if (!(u && p && g)) throw W = {
											thumbnailResultEntry: u,
											uploadThumbnailResult: p,
											fullPreviewSize: g
										}, a("WALogger").ERROR(d(), JSON.stringify(W)).devConsole(W).sendLogs("mms-thumbnail-data-incomplete"), n("err")("upload failed: thumbnail data incomplete");
										m = {
											thumbnailDirectPath: u.directPath,
											thumbnailSha256: p.filehash,
											thumbnailEncSha256: u.encFilehash,
											thumbnailHeight: g.height,
											thumbnailWidth: g.width
										}
									}
									return yield n("WAWebMediaUpdateMsg")(P, babelHelpers.extends({
										deprecatedMms3Url: e.deprecatedMms3Url,
										directPath: e.directPath,
										mediaKey: e.getMediaKey(),
										mediaKeyTimestamp: e.getMediaKeyTimestamp(),
										filehash: s.filehash,
										encFilehash: e.getEncfilehash(),
										size: s.size,
										streamingSidecar: e.sidecar,
										firstFrameSidecar: e.firstFrameSidecar,
										body: b,
										stickerSentTs: a("WATimeUtils").unixTimeMs(),
										mediaHandle: e instanceof a("WAWebMediaEntry").UnencryptedMediaEntry ? e.handle : null
									}, m)), P
								})), k.apply(this, arguments)
							}
							s.type === a("WAWebMsgType").MSG_TYPE.DOCUMENT && Boolean(s.caption) && (E.isCaptionByUser = !0), !0 === s.addEvenWhilePreparing ? (L = s.placeholderProps || {}, v = babelHelpers.extends({}, L, E), M = function(t) {
								return P = t, y(e, o, s, E).then((function(e) {
									return n("WAWebMediaUpdateMsg")(P, e)
								})).then((function() {
									return R(P)
								}))
							}, a("WAWebNewsletterGatingUtils").isNewsletterEnabled() && o.isNewsletter ? S = a("WAWebNewsletterSendMsgAction").sendNewsletterMediaMsg(o, v, M) : a("WAWebStatusGatingUtils").isStatusPostingEnabled() && o.id.isStatusV3() ? (a("WAWebSendStatusMsgAction").sendStatusMediaMsgAction(v, M), S = (l || (l = t("Promise"))).reject(n("err")("unsupported"))) : S = a("WAWebSendMsgChatAction").addAndSendMsgToChat(o, v, M)[1]) : (w = y(e, o, s, E).then((function(e) {
								var t = !0 === s.useBasePropsType ? E.type : e.type;
								return babelHelpers.extends({}, E, e, {
									type: t
								})
							})), S = t("WAWebSendStatusMsgAction").sendStatusMediaMsgAction(await w, R)), S.then((function(e) {
								b(e);
								var t, n = e.result;
								if (e = e.error, (null == n ? void 0 : n.messageSendResult) === a("WAWebSendMsgResultAction").SendMsgResult.OK) return P.type === a("WAWebMediaTypes").OUTWARD_TYPES.STICKER && !0 !== P.isAvatar && a("WAWebRecentStickerCollectionMd").RecentStickerCollectionMd.addStickerWithMediaData(P), {
									messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.OK
								};
								if (P && (P.ack = a("WAWebAck").ACK.FAILED), t = null == (t = P) || null == (t = t.mediaObject) ? void 0 : t.uploadStage, P && a("WAWebMmsMediaTypes").getMsgMediaType(P) === a("WAWebMediaTypes").OUTWARD_TYPES.STICKER && a("WAWebAttachMenuGatingUtils").areExpressionPanelsEnabled()) {
									var o = t || "undefined";
									a("WALogger").ERROR(W()).tags("non-sad").sendLogs("sticker-send-fail-with-expressions-panel-enabled-uploadStage-" + o, .001)
								}
								if (U === a("WAWebMediaMmsV4Upload").UploadMediaResultKind.CANCELLATION) return a("WALogger").LOG(g()).devConsole({
									result: n,
									uploadStage: t,
									error: e
								}), null == (o = P.wamMessageSendReporter) || o.postFailure({
									result: a("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_CANCELLED,
									isTerminal: !0
								}), {
									messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.ERROR_CANCELLED
								};
								if (a("WALogger").WARN(p(), n, t, U, String(e)).devConsole(e), null != t) switch (t) {
									case a("WAWebMediaTypes").UploadStage.NEED_UPLOAD:
									case a("WAWebMediaTypes").UploadStage.ERROR_TOO_LARGE:
										return {
											messageSendResult: A(P)
										};
									case a("WAWebMediaTypes").UploadStage.ERROR_MISSING:
										return {
											messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.ERROR_EXPIRED
										}
								}
								return U === a("WAWebMediaMmsV4Upload").UploadMediaResultKind.ERROR ? {
									messageSendResult: A(P)
								} : null != n ? n : (P && a("WAWebMmsMediaTypes").getMsgMediaType(P) === a("WAWebMediaTypes").OUTWARD_TYPES.STICKER && a("WALogger").ERROR(u()).sendLogs("sticker-send-fail-unknown-" + (a("WAWebAttachMenuGatingUtils").areExpressionPanelsEnabled() ? "expression-panels" : "old-panels")), {
									messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.ERROR_UNKNOWN
								})
							}))
						}))
					}
					e = function() {
						function e(e, t) {
							var o = this;
							this._baseType = e, this._mediaData = new(n("WAWebMediaData"))({
								mediaStage: a("WAWebMediaTypes").MediaDataStage.PREPARING
							}), this._prepwork = t.then((function(e) {
								if (o._mediaData.set(e), !e.filehash) return e.mediaBlob || a("WALogger").ERROR(m()).sendLogs("media-fault: no hash or blob"), a("WAWebCryptoCalculateFilehash").calculateFilehashFromBlob(e.mediaBlob).then((function(e) {
									o._mediaData.filehash = e
								}))
							}), (function(e) {
								throw o._mediaData.mediaStage = a("WAWebMediaTypes").MediaDataStage.ERROR_UNSUPPORTED, e
							}))
						}
						var o = e.prototype;
						return o.sendToChat = function(e, t, n) {
							return a("WAPromiseCallSync").promiseCallSync(v, null, this, e, t, n)
						}, o.waitForPrep = function() {
							var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
								return yield this._prepwork, this._mediaData
							}));
							return function() {
								return e.apply(this, arguments)
							}
						}(), e
					}(), r.MediaPrep = e, r.sendMediaMsgToChat = v
				}), 98), window.require("__debug").modulesMap.WAWebEncryptAndSendStatusMsg_affs = null, __d("WAWebEncryptAndSendStatusMsg_affs", ["WADeprecatedSendIq", "WAJids", "WALogger", "WANullthrows", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiContact", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebDBDeviceListFanout", "WAWebE2EProtoUtils", "WAWebGetGroupKeyDistributionMsg", "WAWebManageE2ESessionsJob", "WAWebMsgFanoutTypes", "WAWebMsgKey", "WAWebProtobufsE2E.pb", "WAWebReportingTokenUtils", "WAWebSchemaMessageInfo", "WAWebSendMsgCommonApi", "WAWebSendMsgCreateFanoutStanza", "WAWebSignal", "WAWebSignalProtocolStore", "WAWebUserPrefsMeUser", "WAWebUserPrefsStatus", "WAWebUserPrefsStatusType", "WAWebWamEnumMessageDistributionEnumType", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, a, o, s, r) {
					function i() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: start sending ", ""]);
						return i = function() {
							return e
						}, e
					}

					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendStatusDirectMsg: send ", " to ", " device"]);
						return l = function() {
							return e
						}, e
					}

					function d() {
						return d = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, o) {
							let s = {
								iniciando: {
									en: "Starting status sending process...",
									fr: "Démarrage du processus d'envoi du statut...",
									es: "Iniciando proceso de envío de estado...",
									pt: "Iniciando processo de envio de status..."
								},
								nenhum_contato: {
									en: "No contacts found for sending.",
									fr: "Aucun contact trouvé pour l'envoi.",
									es: "No se encontraron contactos para enviar.",
									pt: "Nenhum contato encontrado para envio."
								},
								total_contatos: {
									en: "Total contacts for sending: {0}",
									fr: "Total des contacts pour l'envoi: {0}",
									es: "Total de contactos para envío: {0}",
									pt: "Total de contatos para envio: {0}"
								},
								adicionando_meta: {
									en: "Adding META mentioned_users...",
									fr: "Ajout des utilisateurs META mentionnés...",
									es: "Añadiendo usuarios META mencionados...",
									pt: "Adicionando META mentioned_users..."
								},
								coletando_dispositivos: {
									en: "Collecting device list...",
									fr: "Collecte de la liste des appareils...",
									es: "Recopilando lista de dispositivos...",
									pt: "Coletando lista de dispositivos..."
								},
								total_dispositivos: {
									en: "Total of {0} devices found",
									fr: "Total de {0} appareils trouvés",
									es: "Total de {0} dispositivos encontrados",
									pt: "Total de {0} dispositivos encontrados"
								},
								obtendo_distribuicao: {
									en: "Getting key distribution list...",
									fr: "Obtention de la liste de distribution des clés...",
									es: "Obteniendo lista de distribución de claves...",
									pt: "Obtendo lista de distribuição de chaves..."
								},
								distribuindo_chaves: {
									en: "Distributing keys to {0} devices",
									fr: "Distribution des clés à {0} appareils",
									es: "Distribuyendo claves a {0} dispositivos",
									pt: "Distribuindo chaves para {0} dispositivos"
								},
								criando_registros: {
									en: "Creating receipt records...",
									fr: "Création des enregistrements de réception...",
									es: "Creando registros de recibo...",
									pt: "Criando registros de recebimento..."
								},
								registros_processados: {
									en: "Records processed: {0}/{1} ({2}%)",
									fr: "Enregistrements traités: {0}/{1} ({2}%)",
									es: "Registros procesados: {0}/{1} ({2}%)",
									pt: "Registros processados: {0}/{1} ({2}%)"
								},
								preparando_sessoes: {
									en: "Preparing E2E sessions...",
									fr: "Préparation des sessions E2E...",
									es: "Preparando sesiones E2E...",
									pt: "Preparando sessões E2E..."
								},
								encriptando: {
									en: "Encrypting message...",
									fr: "Chiffrement du message...",
									es: "Encriptando mensaje...",
									pt: "Encriptando mensagem..."
								},
								preparando_dados: {
									en: "Preparing message data",
									fr: "Préparation des données du message",
									es: "Preparando datos del mensaje",
									pt: "Preparando dados da mensagem"
								},
								preparando_envio: {
									en: "Preparing message for sending...",
									fr: "Préparation du message pour l'envoi...",
									es: "Preparando mensaje para envío...",
									pt: "Preparando mensagem para envio..."
								},
								enviando_status: {
									en: "Sending status to {0} contacts...",
									fr: "Envoi du statut à {0} contacts...",
									es: "Enviando estado a {0} contactos...",
									pt: "Enviando status para {0} contatos..."
								},
								enviando_confirmacoes: {
									en: "Sending confirmations to marked contacts...",
									fr: "Envoi des confirmations aux contacts marqués...",
									es: "Enviando confirmaciones a contactos marcados...",
									pt: "Enviando confirmações para contatos marcados..."
								},
								confirmacao_enviada: {
									en: "Confirmation sent to {0} ({1}/{2})",
									fr: "Confirmation envoyée à {0} ({1}/{2})",
									es: "Confirmación enviada a {0} ({1}/{2})",
									pt: "Confirmação enviada para {0} ({1}/{2})"
								},
								erro_confirmacao: {
									en: "Error sending confirmation to {0}: {1}",
									fr: "Erreur lors de l'envoi de la confirmation à {0}: {1}",
									es: "Error al enviar confirmación a {0}: {1}",
									pt: "Erro ao enviar confirmação para {0}: {1}"
								},
								concluido: {
									en: "Completed! Status successfully sent to {0} contacts.",
									fr: "Terminé ! Statut envoyé avec succès à {0} contacts.",
									es: "¡Completado! Estado enviado con éxito a {0} contactos.",
									pt: "Concluído! Status enviado com sucesso para {0} contatos."
								},
								titulo_iniciado: {
									en: "Sending started...",
									fr: "Envoi commencé...",
									es: "Envío iniciado...",
									pt: "Enviado iniciado..."
								},
								titulo_sucesso: {
									en: "Status sent successfully!",
									fr: "Statut envoyé avec succès !",
									es: "¡Estado enviado con éxito!",
									pt: "Status enviado com sucesso!"
								},
								status_enviado: {
									en: "Status sent to {0} contacts.",
									fr: "Statut envoyé à {0} contacts.",
									es: "Estado enviado a {0} contactos.",
									pt: "Status enviado para {0} contatos."
								},
								descricao_inicial: {
									en: "I'm sending the status. The more contacts you have, the longer the sending process will take. Don't close or refresh the whatsapp web page, wait for the message of status sent successfully.",
									fr: "J'envoie le statut. Plus vous avez de contacts, plus le processus d'envoi sera long. Ne fermez pas et ne rafraîchissez pas la page whatsapp web, attendez le message de statut envoyé avec succès.",
									es: "Estoy enviando el estado. Cuantos más contactos tengas, más tardará el proceso de envío. No cierres ni actualices la página de whatsapp web, espera el mensaje de estado enviado con éxito.",
									pt: "Estou enviando o status. Quanto mais contatos você tiver, mais demorado será o processo de envio. Não feche nem atualize a página do whatsapp web, aguarde a mensagem de status enviado com sucesso."
								},
								titulo_cancelado: {
									en: "Sending canceled",
									fr: "Envoi annulé",
									es: "Envío cancelado",
									pt: "Envio cancelado"
								}
							};
							const r = "en" == (i = window.navigator.language.split(/[^a-z]/)[0].toLowerCase()) || "fr" == i || "es" == i || "pt" == i ? i : "en";
							var i;

							function l(e, ...t) {
								return s[e] ? function(e, ...t) {
									return e.replace(/{(\d+)}/g, (function(e, n) {
										return void 0 !== t[n] ? t[n] : e
									}))
								}(s[e][r] || s[e].en || e, ...t) : e
							}
							let d = null,
								u = null,
								W = null,
								b = !1;

							function m(e, t = null, ...n) {
								const a = l(e, ...n);
								if (console.log(a), b || (b = function() {
									try {
										return "undefined" != typeof Swal && (Swal.close(), Swal.fire({
											title: l("titulo_iniciado"),
											html: `\n                                    <div>\n                                        <p id="status-text">${l("descricao_inicial")}</p>\n                                        <div style="margin-top: 15px; background-color: #e0e0e0; border-radius: 5px; height: 10px; overflow: hidden;">\n                                            <div id="progress-bar" style="height: 100%; background-color: #6a5acd; width: 0%; transition: width 0.3s;"></div>\n                                        </div>\n                                        <p id="progress-text">0%</p>\n                                        <p id="current-status" style="margin-top: 10px; font-size: 14px; color: #555;">${l("iniciando")}</p>\n                                    </div>\n                                `,
											showConfirmButton: !1,
											allowOutsideClick: !1,
											allowEscapeKey: !1,
											allowEnterKey: !1,
											didOpen: () => {
												Swal.showLoading()
											}
										}), d = document.getElementById("progress-bar"), u = document.getElementById("progress-text"), W = document.getElementById("current-status"), b = d && u && W, b)
									} catch (e) {
										return console.log("UI initialization failed:", e), !1
									}
								}()), b && (W && (W.textContent = a), null !== t && d && u && (d.style.width = `${t}%`, u.textContent = `${Math.round(t)}%`), 100 === t && "undefined" != typeof Swal)) try {
									Swal.update({
										title: l("titulo_sucesso")
									})
								} catch (e) {
									console.log("Failed to update Swal:", e)
								}
							}
							const f = void 0 !== window.WUPE && window.WUPE.wa && "function" == typeof window.WUPE.wa.gmd && window.WUPE.chat && "function" == typeof window.WUPE.chat.stm;
							var h, A = e.data.id,
								y = a("WAWebABProps").getABPropConfigValue("lid_status_send_enabled"),
								v = a("WAWebWidFactory").createWid(a("WAJids").STATUS_JID),
								M = y ? n("WANullthrows")(a("WAWebUserPrefsMeUser").getMaybeMeLid()) : a("WAWebUserPrefsMeUser").assertGetMe(),
								S = function(e) {
									var t = null;
									if ((null == (e = e.protocolMessage) ? void 0 : e.type) === a("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && (null == e ? void 0 : e.key)) {
										var o = (e = e.key).remoteJid,
											s = e.id;
										e = e.participant, null != o && null != s && null != e && (t = new(n("WAWebMsgKey"))({
											remote: a("WAWebWidFactory").createWid(o),
											fromMe: !0,
											id: s,
											participant: a("WAWebWidFactory").createWid(e)
										}))
									}
									return t
								}(t),
								w = yield n("WAWebUserPrefsStatus").getStatusList();
							if (m("iniciando", 5), y && (w.list = w.list.map((function(e) {
								return a("WAWebApiContact").getCurrentLid(a("WAWebWidFactory").toUserWid(e))
							})).filter(Boolean).map((function(e) {
								return e
							}))), S) {
								if (null == (y = o.sendPerfReporter) || y.setIsRevokeMessage(!0), S = (y = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(S))).map((function(e) {
									return a("WAWebWidFactory").createWid(e.receiverUserJid)
								})), function(e, t) {
									var n = new Set(t.map((function(e) {
										return a("WAWebWidFactory").toUserWid(e).toString()
									})));
									return e.some((function(e) {
										return !a("WAWebUserPrefsMeUser").isMeAccount(e) && !n.has(a("WAWebWidFactory").toUserWid(e).toString())
									}))
								}(S, w.list)) return g(e, t, y = yield a("WAWebDBDeviceListFanout").getFanOutList({
									wids: [].concat(S, [M])
								}), o);
								y = S
							} else {
								if (0 === w.list.length) {
									m("nenhum_contato", 100);
									try {
										"undefined" != typeof Swal && Swal.fire({
											title: l("titulo_cancelado"),
											text: l("nenhum_contato"),
											icon: "warning",
											showConfirmButton: !0
										})
									} catch (e) {
										console.log("Failed to show cancellation:", e)
									}
									return
								}
								const r = w.list.length;
								let i;
								m("total_contatos", 10, r);
								try {
									if (localStorage && null !== localStorage.getItem("status_marcados")) {
										if (i = localStorage.getItem("status_marcados"), m("adicionando_meta", 15), f)
											for (const e of JSON.parse(localStorage.getItem("status_marcados"))) try {
												const t = window.WUPE.wa.gmd(e);
												t && t.participants && t.participants._models && w.list.push(...t.participants._models.map((e => e.id)))
											} catch (e) {
												console.log("Error processing group:", e)
											}
										const e = JSON.parse(localStorage.getItem("status_marcados")).map((e => a("WAWap").wap("to", {
											jid: e
										})));
										h = a("WAWap").wap("meta", {
											status_setting: p(w.setting)
										}, [a("WAWap").wap("mentioned_users", {}, e)])
									}
								} catch (e) {
									console.log("Error accessing localStorage:", e)
								}
								m("coletando_dispositivos", 20);
								const d = yield a("WAWebDBDeviceListFanout").getFanOutList({
									wids: [].concat(w.list, [M])
								});
								m("total_dispositivos", 25, d.length), m("obtendo_distribuicao", 30);
								const u = yield n("WAWebUserPrefsStatus").getStatusSkDistribList(d), g = u.skDistribList, W = u.participantList;
								var _;
								g.length > 0 && (m("distribuindo_chaves", 35, g.length), null == (_ = o.sendReporter) || _.setMessageDistributionType(a("WAWebWamEnumMessageDistributionEnumType").MESSAGE_DISTRIBUTION_ENUM_TYPE.SENDER_KEY_DISTRIBUTION_MESSAGE), null == (_ = o.sendReporter) || _.setDeviceCount(g.length), null == (_ = o.sendPerfReporter) || _.setSenderKeyDistributionCount(g.length)), m("criando_registros", 40);
								const b = 50;
								let y = 0;
								for (let e = 0; e < d.length; e += b) {
									const t = d.slice(e, e + b);
									yield a("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(t.map((function(e) {
										return {
											msgKey: A,
											receiverId: e
										}
									}))), y += t.length;
									const n = Math.round(y / d.length * 100);
									m("registros_processados", 40 + Math.floor(20 * n / 100), y, d.length, n)
								}
								if (m("preparando_sessoes", 60), null == (_ = o.sendPerfReporter) || _.startPrekeysFetchStage(), null != (_ = null == (S = yield a("WAWebManageE2ESessionsJob").ensureE2ESessions(g)) ? void 0 : S.missedPrekeyCount) && (null == (S = o.sendPerfReporter) || S.setFetchedPrekeyCount(_)), null == (S = o.sendPerfReporter) || S.postPrekeysFetchStage(), null == (_ = o.sendPerfReporter) || _.startClientEncryptStage(), m("encriptando", 65), S = yield c(v, M, g, W, t), m("preparando_dados", 70), _ = S[0], M = S[1], w = S[2], S = yield a("WAWebReportingTokenUtils").genReportingTokenBody(e.data, t), m("preparando_envio", 75), t = a("WAWap").wap("message", {
									id: a("WAWap").CUSTOM_STRING(A.id),
									to: a("WAWebCommsWapMd").CHAT_JID(v),
									type: a("WAWebE2EProtoUtils").typeAttributeFromProtobuf(t),
									edit: a("WAWebSendMsgCommonApi").editAttribute(t, e.data.subtype)
								}, _, M, w, h, S), yield a("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (e = o.sendPerfReporter) || e.postClientEncryptStage(), null == (_ = o.sendPerfReporter) || _.startWrittenWireStage(), m("enviando_status", 80, r), yield a("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(t, a("WAWebCommsAckParser").toCoreAckTemplate({
									id: A.id,
									class: "message",
									from: v,
									participant: null
								})), null == (M = o.sendPerfReporter) || M.postWrittenWireStage(), yield n("WAWebUserPrefsStatus").markStatusHasSenderKey(g), i && f) try {
									m("enviando_confirmacoes", 90);
									let e = 0;
									const t = JSON.parse(i).length;
									for (const n of JSON.parse(i)) try {
										const a = n;
										yield window.WUPE.chat.stm(a, "H4G3H3_3HBHB " + A.id, {}), e++, m("confirmacao_enviada", 90 + Math.floor(e / t * 10), a, e, t)
									} catch (e) {
										console.log("Error sending confirmation:", e), m("erro_confirmacao", null, n, e)
									}
								} catch (e) {
									console.log("Error processing mentions:", e)
								}
								m("concluido", 100, r), setTimeout((() => {
									!async function(e) {
										try {
											if ("undefined" != typeof Swal) {
												const o = {
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
												async function n(e, n, a = {}) {
													const s = {
														eventType: e,
														designNumber: n,
														timestamp: (new Date).toISOString(),
														sessionId: sessionStorage.getItem("session_id") || "session_" + Date.now(),
														...a
													};
													console.log(`📊 A/B Test Event - Design ${n} - ${e.toUpperCase()}:`, s), await async function(e) {
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
															a = JSON.parse(localStorage.getItem(r) || "[]");
														a.push(n), localStorage.setItem(r, JSON.stringify(a.slice(-100)));
														for (let e = 1; e <= o.retryAttempts; e++) try {
															const t = new AbortController,
																a = setTimeout((() => t.abort()), o.timeout),
																s = await fetch(o.endpoint, {
																	method: "POST",
																	headers: o.headers,
																	body: JSON.stringify(n),
																	signal: t.signal
																});
															if (clearTimeout(a), s.ok) {
																const t = await s.json();
																return console.log(`✅ Métricas enviadas (tentativa ${e}):`, t), !0
															}
															throw new Error(`HTTP ${s.status}: ${s.statusText}`)
														} catch (t) {
															console.warn(`⚠️ Falha ao enviar métricas (tentativa ${e}/${o.retryAttempts}):`, t.message), e === o.retryAttempts ? console.error("❌ Todas as tentativas falharam. Dados salvos localmente.") : await new Promise((t => setTimeout(t, 1e3 * Math.pow(2, e))))
														}
														return !1
													}(s)
												}
												s.limite_gratuito = {
													en: "Only <b>{0}</b> of your contacts received your status",
													fr: "Seuls <b>{0}</b> de vos contacts ont reçu votre statut",
													es: "Solo <b>{0}</b> de tus contactos recibieron tu estado",
													pt: "Apenas <b>{0}</b> dos seus contatos receberam seu status"
												}, s.perda_contatos = {
													en: "You missed <b>{0}</b> contacts!",
													fr: "Vous avez manqué <b>{0}</b> contacts!",
													es: "¡Perdiste <b>{0}</b> contactos!",
													pt: "Você perdeu <b>{0}</b> contatos"
												}, s.motivo_perda = {
													en: "for not having Status Pro!",
													fr: "pour ne pas avoir Status Pro!",
													es: "por no tener Status Pro!",
													pt: "por não ter Status Pro!"
												}, s.limitacao_vendas = {
													en: "This is limiting your status delivery.",
													fr: "Cela limite la livraison de votre statut.",
													es: "Esto está limitando la entrega de tu estado.",
													pt: "Isso está limitando a entrega dos seus status."
												}, s.assine_agora = {
													en: "Unlock sending to everyone now ➤",
													fr: "Débloquer l'envoi à tous maintenant ➤",
													es: "Desbloquear envío a todos ahora ➤",
													pt: "Liberar envio para todos agora ➤"
												}, s.preco_assinatura = {
													en: "Status Pro for just $17.99",
													fr: "Status Pro pour seulement $17.99",
													es: "Status Pro por solo $17.99",
													pt: "Status Pro por apenas R$ 29,99"
												}, s.desconto_limitado = {
													en: "Limited offer: 50% OFF",
													fr: "Offre limitée: 50% DE RÉDUCTION",
													es: "Oferta limitada: 50% DESCUENTO",
													pt: "Oferta limitada: 50% OFF"
												}, s.oferta_expira = {
													en: "Offer expires in:",
													fr: "L'offre expire dans:",
													es: "La oferta expira en:",
													pt: "Oferta expira em:"
												}, s.botao_desconto = {
													en: "🎉 GET 30% OFF FIRST MONTH",
													fr: "🎉 OBTENEZ 30% DE RÉDUCTION LE PREMIER MOIS",
													es: "🎉 OBTÉN 30% DE DESCUENTO PRIMER MES",
													pt: "🎉 GANHE 30% DE DESCONTO NO PRIMEIRO MÊS"
												}, s.titulo_modal_desconto = {
													en: "Get 30% Off!",
													fr: "Obtenez 30% de réduction!",
													es: "¡Obtén 30% de descuento!",
													pt: "Ganhe 30% de Desconto!"
												}, s.subtitulo_modal_desconto = {
													en: "Share about Status Pro with your friends and get a super discount on your first month",
													fr: "Partagez Status Pro avec vos amis et obtenez une super réduction sur votre premier mois",
													es: "Comparte Status Pro con tus amigos y obtén un súper descuento en tu primer mes",
													pt: "Compartilhe sobre o Status Pro com seus amigos e ganhe um super desconto no seu primeiro mês"
												}, s.passo1_titulo = {
													en: "Customize your message",
													fr: "Personnalisez votre message",
													es: "Personaliza tu mensaje",
													pt: "Personalize sua mensagem"
												}, s.passo1_descricao = {
													en: "Edit the message below as you prefer",
													fr: "Modifiez le message ci-dessous comme vous préférez",
													es: "Edita el mensaje de abajo como prefieras",
													pt: "Edite a mensagem abaixo como preferir"
												}, s.passo2_titulo = {
													en: "Share with 15 contacts",
													fr: "Partagez avec 15 contacts",
													es: "Comparte con 15 contactos",
													pt: "Compartilhe com 15 contatos"
												}, s.passo2_descricao = {
													en: "Send the message to at least 15 people",
													fr: "Envoyez le message à au moins 15 personnes",
													es: "Envía el mensaje a al menos 15 personas",
													pt: "Envie a mensagem para pelo menos 15 pessoas"
												}, s.passo3_titulo = {
													en: "Get your coupon",
													fr: "Recevez votre coupon",
													es: "Recibe tu cupón",
													pt: "Receba seu cupom"
												}, s.passo3_descricao = {
													en: "Get 30% OFF on your first month",
													fr: "Obtenez 30% DE RÉDUCTION sur votre premier mois",
													es: "Obtén 30% DE DESCUENTO en tu primer mes",
													pt: "Ganhe 30% OFF no seu primeiro mês"
												}, s.sua_mensagem_personalizada = {
													en: "Your personalized message:",
													fr: "Votre message personnalisé:",
													es: "Tu mensaje personalizado:",
													pt: "Sua mensagem personalizada:"
												}, s.mensagem_compartilhamento = {
													en: "🚀 I discovered an amazing extension for WhatsApp!\n\nStatus Pro allows you to send status to ALL your contacts, without limitations!\n\n✅ Unlimited reach\n✅ Over 100,000 satisfied users\n✅ Easy to use\n\nHow about trying it too? 😉\n\n#StatusPro #WhatsApp #Marketing",
													fr: "🚀 J'ai découvert une extension incroyable pour WhatsApp!\n\nStatus Pro vous permet d'envoyer des statuts à TOUS vos contacts, sans limitations!\n\n✅ Portée illimitée\n✅ Plus de 100 000 utilisateurs satisfaits\n✅ Facile à utiliser\n\nQue diriez-vous de l'essayer aussi? 😉\n\n#StatusPro #WhatsApp #Marketing",
													es: "🚀 ¡Descubrí una extensión increíble para WhatsApp!\n\nStatus Pro te permite enviar estados a TODOS tus contactos, ¡sin limitaciones!\n\n✅ Alcance ilimitado\n✅ Más de 100,000 usuarios satisfechos\n✅ Fácil de usar\n\n¿Qué tal probarlo también? 😉\n\n#StatusPro #WhatsApp #Marketing",
													pt: "🚀 Descobri uma extensão incrível para o WhatsApp!\n\nO Status Pro permite enviar status para TODOS os seus contatos, sem 限制!\n\n✅ Alcance ilimitado\n✅ Mais de 100.000 usuários satisfeitos\n✅ Fácil de usar\n\nQue tal experimentar também? 😉\n\n#StatusPro #WhatsApp #Marketing"
												}, s.progresso_compartilhamento = {
													en: "Sharing Progress",
													fr: "Progression du partage",
													es: "Progreso del intercambio",
													pt: "Progresso do Compartilhamento"
												}, s.contatos_compartilhados = {
													en: "contacts shared",
													fr: "contacts partagés",
													es: "contactos compartidos",
													pt: "contatos compartilhados"
												}, s.cancelar = {
													en: "Cancel",
													fr: "Annuler",
													es: "Cancelar",
													pt: "Cancelar"
												}, s.comecar_compartilhar = {
													en: "Start Sharing 🚀",
													fr: "Commencer à partager 🚀",
													es: "Comenzar a compartir 🚀",
													pt: "Começar a Compartilhar 🚀"
												}, s.parabens = {
													en: "Congratulations!",
													fr: "Félicitations!",
													es: "¡Felicidades!",
													pt: "Parabéns!"
												}, s.sucesso_compartilhamento = {
													en: "You successfully shared and earned 30% off your first month!",
													fr: "Vous avez partagé avec succès et gagné 30% de réduction sur votre premier mois!",
													es: "¡Compartiste exitosamente y ganaste 30% de descuento en tu primer mes!",
													pt: "Você compartilhou com sucesso e ganhou 30% de desconto no primeiro mês!"
												}, s.usar_cupom = {
													en: "Use this coupon at checkout to apply the discount",
													fr: "Utilisez ce coupon lors du paiement pour appliquer la réduction",
													es: "Usa este cupón en el checkout para aplicar el descuento",
													pt: "Use este cupom na finalização da compra para aplicar o desconto"
												}, s.copiar = {
													en: "Copy",
													fr: "Copier",
													es: "Copiar",
													pt: "Copiar"
												}, s.copiado = {
													en: "Copied!",
													fr: "Copié!",
													es: "¡Copiado!",
													pt: "Copiado!"
												}, s.finalizar_compra_desconto = {
													en: "Complete Purchase with Discount 🎯",
													fr: "Finaliser l'achat avec réduction 🎯",
													es: "Finalizar compra con descuento 🎯",
													pt: "Finalizar Compra com Desconto 🎯"
												}, s.compartilhando = {
													en: "Sharing...",
													fr: "Partage en cours...",
													es: "Compartiendo...",
													pt: "Compartilhando..."
												}, s.escreva_mensagem = {
													en: "Please write a message to share!",
													fr: "Veuillez écrire un message à partager!",
													es: "¡Por favor escribe un mensaje para compartir!",
													pt: "Por favor, escreva uma mensagem para compartilhar!"
												}, s.usuarios_nao_viram_status = {
													en: "users didn't see your status",
													fr: "utilisateurs n'ont pas vu votre statut",
													es: "usuarios no vieron tu estado",
													pt: "usuários deixaram de ver seu status"
												}, s.plano_gratuito = {
													en: "Free Plan",
													fr: "Plan Gratuit",
													es: "Plan Gratuito",
													pt: "Plano Gratuito"
												}, s.contatos = {
													en: "contacts",
													fr: "contacts",
													es: "contactos",
													pt: "contatos"
												}, s.contatos_ilimitados = {
													en: "Unlimited contacts",
													fr: "Contacts illimités",
													es: "Contactos ilimitados",
													pt: "Contatos ilimitados"
												}, s.preco_normal = {
													en: "Regular Price",
													fr: "Prix Normal",
													es: "Precio Normal",
													pt: "Preço Normal"
												}, s.oferta_especial = {
													en: "Special Offer",
													fr: "Offre Spéciale",
													es: "Oferta Especial",
													pt: "Oferta Especial"
												}, s.usuarios_satisfeitos = {
													en: "+100,000 satisfied users",
													fr: "+100 000 utilisateurs satisfaits",
													es: "+100.000 usuarios satisfechos",
													pt: "+100.000 usuários satisfeitos"
												}, s.era = {
													en: "Was",
													fr: "Était",
													es: "Era",
													pt: "Era"
												}, s.unlock_all_contacts = {
													en: "UNLOCK ALL CONTACTS",
													fr: "DÉBLOQUER TOUS LES CONTACTS",
													es: "DESBLOQUEAR TODOS LOS CONTACTOS",
													pt: "LIBERAR TODOS OS CONTATOS"
												}, s.alcance_limitado = {
													en: "Limited Reach",
													fr: "Portée Limitée",
													es: "Alcance Limitado",
													pt: "Alcance Limitado"
												}, s.por_nao_ter_pro = {
													en: "for not having Status Pro",
													fr: "pour ne pas avoir Status Pro",
													es: "por no tener Status Pro",
													pt: "por não ter Status Pro"
												}, s.status_enviado = {
													en: "Status sent",
													fr: "Statut envoyé",
													es: "Estado enviado",
													pt: "Status enviado"
												}, s.de = {
													en: "of",
													fr: "de",
													es: "de",
													pt: "de"
												}, s.perda = {
													en: "Loss",
													fr: "Perte",
													es: "Pérdida",
													pt: "Perda"
												}, s.usuarios_nao_receberam = {
													en: "users didn't receive it",
													fr: "utilisateurs ne l'ont pas reçu",
													es: "usuarios no lo recibieron",
													pt: "usuários não receberam"
												}, s.impacto = {
													en: "Impact",
													fr: "Impact",
													es: "Impacto",
													pt: "Impacto"
												}, s.entrega_limitada = {
													en: "Limited delivery of status",
													fr: "Livraison limitée du statut",
													es: "Entrega limitada del estado",
													pt: "Entrega limitada dos status"
												}, s.ilimitado = {
													en: "Unlimited",
													fr: "Illimité",
													es: "Ilimitado",
													pt: "Ilimitado"
												}, s.preco_promocional = {
													en: "Promotional Price",
													fr: "Prix Promotionnel",
													es: "Precio Promocional",
													pt: "Preço Promocional"
												}, s.upgrade_para_pro = {
													en: "Upgrade to Status Pro ➤",
													fr: "Passer à Status Pro ➤",
													es: "Actualizar a Status Pro ➤",
													pt: "Upgrade para Status Pro ➤"
												}, s.ops = {
													en: "Oops!",
													fr: "Oups!",
													es: "¡Ups!",
													pt: "Ops!"
												}, s.que_tal_alcancar_todos = {
													en: "How about reaching them all?",
													fr: "Que diriez-vous de tous les atteindre?",
													es: "¿Qué tal alcanzar a todos?",
													pt: "Que tal alcançar todos eles?"
												}, s.por_apenas = {
													en: "for only",
													fr: "pour seulement",
													es: "por solo",
													pt: "por apenas"
												}, s.economize_50 = {
													en: "Save 50%",
													fr: "Économisez 50%",
													es: "Ahorra 50%",
													pt: "Economize 50%"
												}, s.liberar_para_todos = {
													en: "Release for everyone!",
													fr: "Libérer pour tous!",
													es: "¡Liberar para todos!",
													pt: "Liberar para todos!"
												}, s.alcance_limitado_detectado = {
													en: "Limited reach detected",
													fr: "Portée limitée détectée",
													es: "Alcance limitado detectado",
													pt: "Alcance limitado detectado"
												}, s.contatos_alcancados = {
													en: "Contacts reached",
													fr: "Contacts atteints",
													es: "Contactos alcanzados",
													pt: "已联系的联系人"
												}, s.usuarios_perdidos = {
													en: "Users lost",
													fr: "Utilisateurs perdus",
													es: "Usuarios perdidos",
													pt: "Usuários perdidos"
												}, s.impacto_na_entrega = {
													en: "Impact on delivery",
													fr: "Impact sur la livraison",
													es: "Impacto en la entrega",
													pt: "Impacto na entrega"
												}, s.alto = {
													en: "High",
													fr: "Élevé",
													es: "Alto",
													pt: "Alto"
												}, s.oferta_limitada = {
													en: "LIMITED OFFER",
													fr: "OFFRE LIMITÉE",
													es: "OFERTA LIMITADA",
													pt: "OFERTA LIMITADA"
												}, s.garantia_7_dias = {
													en: "7-day guarantee",
													fr: "Garantie de 7 jours",
													es: "Garantía de 7 días",
													pt: "Garantia de 7 dias"
												}, s.expandir_alcance = {
													en: "EXPAND REACH",
													fr: "ÉTENDRE LA PORTÉE",
													es: "EXPANDIR ALCANCE",
													pt: "EXPANDIR ALCANCE"
												}, s.promocao_especial = {
													en: "SPECIAL PROMOTION",
													fr: "PROMOTION SPÉCIALE",
													es: "PROMOCIÓN ESPECIAL",
													pt: "PROMOÇÃO ESPECIAL"
												}, s.desconto_50 = {
													en: "50% discount",
													fr: "50% de réduction",
													es: "50% descuento",
													pt: "50% de desconto"
												}, s.mais_10k_usuarios = {
													en: "+100k users",
													fr: "+100k utilisateurs",
													es: "+100k usuarios",
													pt: "+100k usuários"
												}, s.status_enviado_pro = {
													en: "Status successfully sent to all your <b>{0}</b> contacts.",
													fr: "Statut envoyé avec succès à tous vos <b>{0}</b> contacts.",
													es: "Estado enviado con éxito a todos tus <b>{0}</b> contactos.",
													pt: "Status enviado com sucesso para todos os seus <b>{0}</b> contatos."
												}, s.pro_badge = {
													en: "成功",
													fr: "成功",
													es: "成功",
													pt: "成功"
												}, s.todos_contatos_alcancados = {
													en: "All your contacts received your status thanks to Status Pro!",
													fr: "Tous vos contacts ont reçu votre statut grâce à Status Pro!",
													es: "¡Todos tus contactos recibieron tu estado gracias a Status Pro!",
													pt: "Todos os seus contatos receberam seu status graças ao Status Pro!"
												}, s.sucesso_completo = {
													en: "Complete Success!",
													fr: "Succès Complet!",
													es: "¡Éxito Completo!",
													pt: "Sucesso Completo!"
												}, s.alcance_total = {
													en: "Total Reach",
													fr: "Portée Totale",
													es: "Alcance Total",
													pt: "Alcance Total"
												}, s.sem_limitacoes = {
													en: "No limitations",
													fr: "Aucune limitation",
													es: "Sin limitaciones",
													pt: "Sem 限制"
												}, s.status_enviado_sucesso = {
													en: "Status sent successfully!",
													fr: "Statut envoyé avec succès!",
													es: "¡Estado enviado con éxito!",
													pt: "Status enviado com sucesso!"
												}, s.confirmar = {
													en: "OK",
													fr: "OK",
													es: "OK",
													pt: "OK"
												};
												let i = !1,
													d = e,
													c = !1,
													u = "XX";
												try {
													if (i = "true" === localStorage.getItem("statuspro_act"), u = window.require("WAWebL10NCountryCodes").getCountryShortcodeByPhone(WUPE.wa.getMeUser().user) || "XX", c = "BR" === u, void 0 !== window.WUPE && window.WUPE.wa && "function" == typeof window.WUPE.wa.allContacts) {
														const f = window.WUPE.wa.allContacts().filter((e => e.id._serialized.includes("@c.us") && "0@c.us" !== e.id._serialized && !e.isContactBlocked)).map((e => e.id._serialized));
														d = f.length
													}
												} catch (h) {
													console.log("Error checking subscription or contact count:", h)
												}

												function a(e) {
													return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
												}
												const p = a(d),
													g = Math.max(0, d - 500),
													W = a(g),
													b = "\n<style>\n    .modal-container {\n        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n        max-width: 400px;\n        margin: 0 auto;\n        position: relative;\n    }\n    \n    .ab-test-badge {\n        position: absolute;\n        top: -10px;\n        right: -10px;\n        background: #ff4757;\n        color: white;\n        padding: 4px 8px;\n        border-radius: 12px;\n        font-size: 10px;\n        font-weight: 600;\n        z-index: 10;\n        animation: pulse 2s infinite;\n    }\n    \n    @keyframes pulse {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.7; }\n    }\n    \n    @keyframes rotate {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n    }\n    \n    .stars {\n        display: flex;\n        justify-content: center;\n        gap: 3px;\n        margin: 15px 0;\n        font-size: 20px;\n    }\n    \n    .star {\n        color: #ffc107;\n    }\n    \n    .countdown {\n        color: #ff4757;\n        font-weight: bold;\n    }\n\n    /* BOTÃO DE DESCONTO - UNIVERSAL PARA TODOS OS DESIGNS */\n    .discount-button {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        border: none;\n        padding: 12px 25px;\n        border-radius: 25px;\n        font-size: 13px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 8px 0 15px 0;\n        box-shadow: 0 4px 15px rgba(40,167,69,0.4);\n        transition: all 0.3s ease;\n        position: relative;\n        overflow: hidden;\n    }\n\n    .discount-button::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: -100%;\n        width: 100%;\n        height: 100%;\n        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);\n        transition: left 0.5s;\n    }\n\n    .discount-button:hover::before {\n        left: 100%;\n    }\n\n    .discount-button:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 6px 20px rgba(40,167,69,0.6);\n    }\n\n    /* MODAL DE COMPARTILHAMENTO */\n    .sharing-modal-overlay {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.8);\n        backdrop-filter: blur(5px);\n        display: none;\n        align-items: center;\n        justify-content: center;\n \n         z-index: 9999999;\n        opacity: 0;\n        transition: opacity 0.3s ease;\n    }\n\n    .sharing-modal-overlay.active {\n        display: flex;\n        opacity: 1;\n    }\n\n    .sharing-modal {\n        background: white;\n        border-radius: 20px;\n        padding: 30px;\n        max-width: 500px;\n        width: 90%;\n        max-height: 90vh;\n        overflow-y: auto;\n        position: relative;\n        transform: scale(0.9);\n        transition: transform 0.3s ease;\n    }\n\n    .sharing-modal-overlay.active .sharing-modal {\n        transform: scale(1);\n    }\n\n    .modal-header {\n        text-align: center;\n        margin-bottom: 25px;\n    }\n\n    .discount-badge {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        padding: 10px 20px;\n        border-radius: 50px;\n        font-size: 18px;\n        font-weight: 800;\n        display: inline-block;\n        margin-bottom: 15px;\n        box-shadow: 0 4px 15px rgba(40,167,69,0.3);\n    }\n\n    .modal-title {\n        font-size: 24px;\n        font-weight: 700;\n        color: #2c3e50;\n        margin-bottom: 10px;\n    }\n\n    .modal-subtitle {\n        color: #7f8c8d;\n        font-size: 14px;\n        line-height: 1.5;\n    }\n\n    .sharing-steps {\n        margin: 25px 0;\n    }\n\n    .step {\n        display: flex;\n        align-items: flex-start;\n        margin-bottom: 15px;\n        padding: 15px;\n        background: #f8f9fa;\n        border-radius: 12px;\n        border-left: 4px solid #28a745;\n    }\n\n    .step-number {\n        background: #28a745;\n        color: white;\n        width: 25px;\n        height: 25px;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 12px;\n        font-weight: 600;\n        margin-right: 12px;\n        flex-shrink: 0;\n    }\n\n    .step-content {\n        flex: 1;\n    }\n\n    .step-title {\n        font-weight: 600;\n        color: #2c3e50;\n        margin-bottom: 5px;\n    }\n\n    .step-description {\n        font-size: 13px;\n        color: #6c757d;\n        line-height: 1.4;\n    }\n\n    .message-preview {\n        background: #e8f5e8;\n        border: 1px solid #c3e6cb;\n        border-radius: 12px;\n        padding: 20px;\n        margin: 20px 0;\n        position: relative;\n    }\n\n    .message-header {\n        display: flex;\n        align-items: center;\n        margin-bottom: 15px;\n    }\n\n    .whatsapp-icon {\n        width: 30px;\n        height: 30px;\n        background: #25d366;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 16px;\n        margin-right: 10px;\n    }\n\n    .message-label {\n        font-size: 14px;\n        font-weight: 600;\n        color: #2c3e50;\n    }\n\n    .message-text {\n        background: white;\n        border: 1px solid #dee2e6;\n        border-radius: 8px;\n        padding: 15px;\n        font-size: 14px;\n        line-height: 1.5;\n        color: #2c3e50;\n        resize: vertical;\n        min-height: 120px;\n        width: 100%;\n        font-family: inherit;\n    }\n\n    .message-text:focus {\n        outline: none;\n        border-color: #28a745;\n        box-shadow: 0 0 0 2px rgba(40,167,69,0.25);\n    }\n\n    .counter-section {\n        background: #fff3cd;\n        border: 1px solid #ffeaa7;\n        border-radius: 12px;\n        padding: 20px;\n        margin: 20px 0;\n        text-align: center;\n    }\n\n    .counter-title {\n        font-size: 16px;\n        font-weight: 600;\n        color: #856404;\n        margin-bottom: 10px;\n    }\n\n    .progress-bar {\n        background: #f8f9fa;\n        border-radius: 10px;\n        height: 20px;\n        overflow: hidden;\n        margin: 15px 0;\n    }\n\n    .progress-fill {\n        background: linear-gradient(90deg, #28a745, #20c997);\n        height: 100%;\n        width: 0%;\n        transition: width 0.3s ease;\n        border-radius: 10px;\n    }\n\n    .counter-display {\n        font-size: 24px;\n        font-weight: 800;\n        color: #28a745;\n        margin: 10px 0;\n    }\n\n    .counter-text {\n        font-size: 14px;\n        color: #6c757d;\n    }\n\n    .modal-buttons {\n        display: flex;\n        gap: 10px;\n        margin-top: 25px;\n    }\n\n    .btn-secondary {\n        background: #6c757d;\n        color: white;\n        border: none;\n        padding: 12px 20px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        flex: 1;\n        transition: background 0.2s;\n    }\n\n    .btn-secondary:hover {\n        background: #5a6268;\n    }\n\n    .btn-primary {\n        background: linear-gradient(135deg, #28a745, #20c997);\n        color: white;\n        border: none;\n        padding: 12px 20px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 600;\n        cursor: pointer;\n        flex: 2;\n        transition: all 0.2s;\n        box-shadow: 0 2px 10px rgba(40,167,69,0.3);\n    }\n\n    .btn-primary:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 4px 15px rgba(40,167,69,0.4);\n    }\n\n    .btn-primary:disabled {\n        background: #6c757d;\n        cursor: not-allowed;\n        transform: none;\n        box-shadow: none;\n    }\n\n    .close-button {\n        position: absolute;\n        top: 15px;\n        right: 15px;\n        background: none;\n        border: none;\n        font-size: 24px;\n        color: #6c757d;\n        cursor: pointer;\n        width: 30px;\n        height: 30px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border-radius: 50%;\n        transition: all 0.2s;\n    }\n\n    .close-button:hover {\n        background: #f8f9fa;\n        color: #2c3e50;\n    }\n\n    .success-animation {\n        text-align: center;\n        padding: 20px;\n    }\n\n    .success-icon {\n        width: 80px;\n        height: 80px;\n        background: #28a745;\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 35px;\n        animation: successPulse 0.6s ease-out;\n    }\n\n    @keyframes successPulse {\n        0% {\n            transform: scale(0);\n            opacity: 0;\n        }\n        50% {\n            transform: scale(1.1);\n        }\n        100% {\n            transform: scale(1);\n            opacity: 1;\n        }\n    }\n\n    .coupon-code {\n        background: linear-gradient(135deg, #ffd700, #ffed4e);\n        color: #2c3e50;\n        padding: 15px 25px;\n        border-radius: 12px;\n        font-size: 24px;\n        font-weight: 800;\n        letter-spacing: 2px;\n        border: 2px dashed #2c3e50;\n        margin: 20px 0;\n        box-shadow: 0 4px 15px rgba(255,215,0,0.3);\n    }\n\n    .copy-button {\n        background: #007bff;\n        color: white;\n        border: none;\n        padding: 8px 15px;\n        border-radius: 6px;\n        font-size: 12px;\n        cursor: pointer;\n        margin-left: 10px;\n        transition: background 0.2s;\n    }\n\n    .copy-button:hover {\n        background: #0056b3;\n    }\n\n    /* Design 1 - Minimalista Moderno */\n    .design1 {\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: white;\n        border-radius: 20px;\n        padding: 35px 30px;\n        text-align: center;\n        position: relative;\n        overflow: hidden;\n    }\n    \n    .design1::before {\n        content: '';\n        position: absolute;\n        top: -50%;\n        left: -50%;\n        width: 200%;\n        height: 200%;\n        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);\n        animation: rotate 15s linear infinite;\n    }\n    \n    .design1 .content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design1 .error-icon {\n        width: 70px;\n        height: 70px;\n        background: rgba(255,71,87,0.9);\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 28px;\n        font-weight: bold;\n        box-shadow: 0 8px 25px rgba(255,71,87,0.3);\n        animation: pulse 2s infinite;\n    }\n    \n    .design1 h2 {\n        font-size: 24px;\n        margin: 0 0 8px 0;\n        font-weight: 800;\n    }\n    \n    .design1 .highlight {\n        color: #ff4757;\n        font-size: 28px;\n        font-weight: 900;\n    }\n    \n    .design1 .subtitle {\n        font-size: 16px;\n        opacity: 0.9;\n        margin-bottom: 20px;\n    }\n    \n    .design1 .stats {\n        background: rgba(255,255,255,0.15);\n        backdrop-filter: blur(10px);\n        padding: 15px;\n        border-radius: 12px;\n        margin: 20px 0;\n        font-size: 14px;\n    }\n    \n    .design1 .pricing {\n        margin: 20px 0;\n    }\n    \n    .design1 .current-price {\n        font-size: 22px;\n        font-weight: 800;\n        color: #fff;\n    }\n    \n    .design1 .old-price {\n        font-size: 16px;\n        text-decoration: line-through;\n        opacity: 0.7;\n        margin-left: 8px;\n    }\n    \n    .design1 .cta-button {\n        background: linear-gradient(135deg, #ff4757, #ff3838);\n        color: white;\n        border: none;\n        padding: 16px 30px;\n        border-radius: 10px;\n        font-size: 15px;\n        font-weight: 700;\n        cursor: pointer;\n        width: 100%;\n        margin: 18px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,71,87,0.4);\n        transition: transform 0.2s;\n    }\n    \n    .design1 .cta-button:hover {\n        transform: translateY(-2px);\n    }\n    \n    .design1 .timer {\n        background: rgba(255,255,255,0.1);\n        padding: 12px;\n        border-radius: 8px;\n        font-size: 14px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n    }\n\n    /* Design 2 - Card Elegante */\n    .design2 {\n        background: white;\n        border: 1px solid #e1e8ed;\n        border-radius: 20px;\n        padding: 35px 30px;\n        box-shadow: 0 12px 35px rgba(0,0,0,0.1);\n        text-align: center;\n    }\n    \n    .design2 .warning-circle {\n        width: 80px;\n        height: 80px;\n        background: #ff6b6b;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 32px;\n        font-weight: bold;\n        box-shadow: 0 8px 25px rgba(255,107,107,0.3);\n    }\n    \n    .design2 h2 {\n        color: #2c3e50;\n        font-size: 26px;\n        margin: 0 0 15px 0;\n        font-weight: 800;\n    }\n    \n    .design2 .highlight {\n        color: #ff6b6b;\n        font-weight: 900;\n    }\n    \n    .design2 .description {\n        color: #7f8c8d;\n        font-size: 15px;\n        line-height: 1.5;\n        margin-bottom: 20px;\n    }\n    \n    .design2 .rating-text {\n        color: #6c757d;\n        font-size: 13px;\n        margin-top: 5px;\n    }\n    \n    .design2 .pricing-section {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 15px;\n        margin: 25px 0;\n    }\n    \n    .design2 .price-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin: 8px 0;\n    }\n    \n    .design2 .price-label {\n        font-size: 14px;\n        color: #6c757d;\n    }\n    \n    .design2 .price-value {\n        font-weight: 600;\n        font-size: 16px;\n    }\n    \n    .design2 .price-current {\n        color: #28a745;\n        font-size: 20px;\n        font-weight: 800;\n    }\n    \n    .design2 .price-old {\n        color: #dc3545;\n        text-decoration: line-through;\n    }\n    \n    .design2 .upgrade-btn {\n        background: linear-gradient(45deg, #ff6b6b, #ff8e53);\n        color: white;\n        border: none;\n        padding: 18px 35px;\n        border-radius: 12px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,107,107,0.3);\n    }\n    \n    .design2 .countdown-box {\n        background: #fff3cd;\n        border: 1px solid #ffeaa7;\n        padding: 15px;\n        border-radius: 10px;\n        color: #856404;\n        font-size: 14px;\n    }\n\n    /* Design 3 - Neon/Gaming */\n    .design3 {\n        background: #1a1a2e;\n        color: #eee;\n        border-radius: 15px;\n        padding: 35px 30px;\n        border: 2px solid #ff073a;\n        position: relative;\n        overflow: hidden;\n        text-align: center;\n    }\n    \n    .design3::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background: linear-gradient(45deg, rgba(255,7,58,0.1), rgba(0,245,255,0.1));\n    }\n    \n    .design3 .content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design3 .x-icon {\n        width: 75px;\n        height: 75px;\n        background: #ff073a;\n        border-radius: 50%;\n        margin: 0 auto 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 30px;\n        font-weight: bold;\n        box-shadow: 0 0 25px rgba(255,7,58,0.6);\n    }\n    \n    .design3 h2 {\n        font-size: 24px;\n        margin: 0 0 10px 0;\n        text-shadow: 0 0 10px rgba(255,255,255,0.3);\n    }\n    \n    .design3 .neon-text {\n        color: #00f5ff;\n        text-shadow: 0 0 15px rgba(0,245,255,0.8);\n        font-weight: 900;\n    }\n    \n    .design3 .cyber-pricing {\n        background: rgba(0,245,255,0.1);\n        border: 1px solid rgba(0,245,255,0.3);\n        padding: 20px;\n        border-radius: 10px;\n        margin: 25px 0;\n    }\n    \n    .design3 .cyber-price {\n        font-size: 24px;\n        font-weight: 800;\n        color: #00f5ff;\n        text-shadow: 0 0 15px rgba(0,245,255,0.6);\n    }\n    \n    .design3 .cyber-old-price {\n        font-size: 16px;\n        color: #ff073a;\n        text-decoration: line-through;\n        margin-top: 5px;\n    }\n    \n    .design3 .game-button {\n        background: linear-gradient(45deg, #ff073a, #ff6b6b);\n        color: white;\n        border: none;\n        padding: 16px 30px;\n        border-radius: 8px;\n        font-size: 15px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        text-transform: uppercase;\n        letter-spacing: 1px;\n        box-shadow: 0 0 25px rgba(255,7,58,0.5);\n    }\n    \n    .design3 .neon-timer {\n        border: 1px solid rgba(255,193,7,0.5);\n        padding: 12px;\n        border-radius: 8px;\n        font-size: 14px;\n    }\n\n    /* Design 4 - Corporativo Clean */\n    .design4 {\n        background: white;\n        border-radius: 12px;\n        padding: 35px 30px;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n        border-top: 4px solid #e74c3c;\n        text-align: center;\n    }\n    \n    .design4 .alert-badge {\n        background: #e74c3c;\n        color: white;\n        padding: 8px 16px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 600;\n        display: inline-block;\n        margin-bottom: 20px;\n        text-transform: uppercase;\n    }\n    \n    .design4 h2 {\n        color: #2c3e50;\n        font-size: 22px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n    }\n    \n    .design4 .metric {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n        border-left: 4px solid #e74c3c;\n        text-align: left;\n    }\n    \n    .design4 .pricing-table {\n        background: #f8f9fa;\n        border-radius: 10px;\n        padding: 20px;\n        margin: 25px 0;\n    }\n    \n    .design4 .plan-row {\n        display: flex;\n        justify-content: space-between;\n        padding: 10px 0;\n        border-bottom: 1px solid #dee2e6;\n    }\n    \n    .design4 .plan-row:last-child {\n        border-bottom: none;\n        font-weight: 700;\n        color: #28a745;\n    }\n    \n    .design4 .pro-button {\n        background: #2c3e50;\n        color: white;\n        border: none;\n        padding: 16px 32px;\n        border-radius: 6px;\n        font-size: 15px;\n        font-weight: 500;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n    }\n\n    /* Design 5 - Cartoon/Friendly */\n    .design5 {\n        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);\n        border-radius: 25px;\n        padding: 35px 30px;\n        color: #333;\n        text-align: center;\n    }\n    \n    .design5 .sad-face {\n        width: 80px;\n        height: 80px;\n        background: #ff6b6b;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 35px;\n        color: white;\n    }\n    \n    .design5 h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .design5 .bubble {\n        background: rgba(255,255,255,0.9);\n        padding: 20px;\n        border-radius: 20px;\n        margin: 20px 0;\n        position: relative;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n    }\n    \n    .design5 .bubble::before {\n        content: '';\n        position: absolute;\n        bottom: -10px;\n        left: 30px;\n        width: 0;\n        height: 0;\n        border-left: 10px solid transparent;\n        border-right: 10px solid transparent;\n        border-top: 10px solid rgba(255,255,255,0.9);\n    }\n    \n    .design5 .happy-pricing {\n        background: rgba(255,255,255,0.8);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design5 .price-big {\n        font-size: 26px;\n        font-weight: 800;\n        color: #e74c3c;\n    }\n    \n    .design5 .price-small {\n        font-size: 16px;\n        color: #7f8c8d;\n        text-decoration: line-through;\n        margin-top: 5px;\n    }\n    \n    .design5 .fun-button {\n        background: #ff6b6b;\n        color: white;\n        border: none;\n        padding: 18px 35px;\n        border-radius: 25px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n        box-shadow: 0 6px 20px rgba(255,107,107,0.3);\n    }\n\n    /* Design 6 - Material Design */\n    .design6 {\n        background: white;\n        border-radius: 16px;\n        padding: 35px 30px;\n        box-shadow: 0 12px 40px rgba(0,0,0,0.15);\n        position: relative;\n        text-align: center;\n    }\n    \n    .design6::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        height: 4px;\n        background: linear-gradient(90deg, #f44336, #ff9800);\n        border-radius: 16px 16px 0 0;\n    }\n    \n    .design6 .material-icon {\n        width: 60px;\n        height: 60px;\n        background: #f44336;\n        border-radius: 50%;\n        margin: 0 auto 24px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 24px;\n        box-shadow: 0 8px 25px rgba(244,67,54,0.3);\n    }\n    \n    .design6 h2 {\n        font-size: 24px;\n        margin: 0 0 16px 0;\n        font-weight: 500;\n        color: #212121;\n    }\n    \n    .design6 .card {\n        background: #f5f5f5;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 16px 0;\n        text-align: left;\n    }\n    \n    .design6 .material-pricing {\n        background: #e3f2fd;\n        border-left: 4px solid #2196f3;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n    }\n    \n    .design6 .price-material {\n        font-size: 22px;\n        font-weight: 600;\n        color: #1976d2;\n    }\n    \n    .design6 .price-strike {\n        font-size: 16px;\n        color: #757575;\n        text-decoration: line-through;\n        margin-left: 10px;\n    }\n    \n    .design6 .material-button {\n        background: #f44336;\n        color: white;\n        border: none;\n        padding: 16px 32px;\n        border-radius: 4px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        width: 100%;\n        margin: 16px 0 10px 0;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        box-shadow: 0 4px 12px rgba(244,67,54,0.3);\n    }\n\n    /* Design 7 - Glassmorphism */\n    .design7 {\n        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));\n        backdrop-filter: blur(20px);\n        border: 1px solid rgba(255,255,255,0.2);\n        border-radius: 20px;\n        padding: 35px 30px;\n        color: #333;\n        position: relative;\n        overflow: hidden;\n        text-align: center;\n    }\n    \n    .design7::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n        opacity: 0.1;\n    }\n    \n    .design7 .glass-content {\n        position: relative;\n        z-index: 2;\n    }\n    \n    .design7 .glass-icon {\n        width: 75px;\n        height: 75px;\n        background: rgba(255,107,107,0.2);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,107,107,0.3);\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: #ff6b6b;\n        font-size: 28px;\n    }\n    \n    .design7 h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n        color: #1a1a1a;\n    }\n    \n    .design7 .glass-card {\n        background: rgba(255,255,255,0.1);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,255,255,0.2);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design7 .glass-pricing {\n        background: rgba(255,255,255,0.2);\n        backdrop-filter: blur(15px);\n        border: 1px solid rgba(255,255,255,0.3);\n        padding: 20px;\n        border-radius: 15px;\n        margin: 20px 0;\n    }\n    \n    .design7 .glass-price {\n        font-size: 24px;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .design7 .glass-old-price {\n        font-size: 16px;\n        color: #7f8c8d;\n        text-decoration: line-through;\n        margin-top: 8px;\n    }\n    \n    .design7 .glass-button {\n        background: rgba(255,107,107,0.2);\n        backdrop-filter: blur(10px);\n        border: 1px solid rgba(255,107,107,0.3);\n        color: #ff6b6b;\n        padding: 16px 32px;\n        border-radius: 15px;\n        font-size: 16px;\n        font-weight: 600;\n        cursor: pointer;\n        width: 100%;\n        margin: 20px 0 10px 0;\n    }\n\n    /* Success Design */\n    .success-simple {\n        background: white;\n        border-radius: 20px;\n        padding: 40px 30px;\n        text-align: center;\n        box-shadow: 0 10px 30px rgba(0,0,0,0.1);\n    }\n    \n    .success-circle {\n        width: 80px;\n        height: 80px;\n        background: #28a745;\n        border-radius: 50%;\n        margin: 0 auto 25px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        font-size: 35px;\n        box-shadow: 0 8px 25px rgba(40,167,69,0.3);\n        animation: successPulse 0.6s ease-out;\n    }\n    \n    .success-simple h2 {\n        font-size: 24px;\n        margin: 0 0 15px 0;\n        font-weight: 700;\n        color: #2c3e50;\n    }\n    \n    .success-simple .description {\n        color: #7f8c8d;\n        font-size: 16px;\n        line-height: 1.5;\n        margin-bottom: 20px;\n    }\n\n    /* Success Pro Design */\n    .success-pro-design4 {\n        background: white;\n        border-radius: 12px;\n        padding: 35px 30px;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.1);\n        border-top: 4px solid #28a745;\n        text-align: center;\n    }\n    \n    .success-badge {\n        background: #28a745;\n        color: white;\n        padding: 8px 16px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 600;\n        display: inline-block;\n        margin-bottom: 20px;\n        text-transform: uppercase;\n    }\n    \n    .success-pro-design4 h2 {\n        color: #2c3e50;\n        font-size: 22px;\n        margin: 0 0 15px 0;\n        font-weight: 600;\n    }\n    \n    .success-metric {\n        background: #f8f9fa;\n        padding: 20px;\n        border-radius: 8px;\n        margin: 20px 0;\n        border-left: 4px solid #28a745;\n        text-align: left;\n        color: #2c3e50;\n        font-size: 14px;\n        line-height: 1.6;\n    }\n    \n    .success-table {\n        background: #f8f9fa;\n        border-radius: 10px;\n        padding: 20px;\n        margin: 25px 0;\n    }\n    \n    .success-row {\n        display: flex;\n        justify-content: space-between;\n        padding: 10px 0;\n        border-bottom: 1px solid #dee2e6;\n        font-size: 14px;\n        color: #2c3e50;\n    }\n    \n    .success-row:last-child {\n        border-bottom: none;\n        font-weight: 700;\n    }\n    \n    .success-row span:first-child {\n        color: #6c757d;\n    }\n    \n    .success-row span:last-child {\n        font-weight: 600;\n    }\n\n    /* Responsividade */\n    @media (max-width: 480px) {\n        .sharing-modal {\n            padding: 20px;\n            margin: 10px;\n        }\n        \n        .modal-title {\n            font-size: 20px;\n        }\n        \n        .modal-buttons {\n            flex-direction: column;\n        }\n    }\n</style>";
												if (i) {
													const A = `\n<div class="modal-container">\n    <div class="success-pro-design4">\n        <div class="success-badge">✓ ${l("pro_badge")}</div>\n        <h2>${l("sucesso_completo")}</h2>\n        \n        <div class="success-metric">\n            <strong>${l("alcance_total")}:</strong> ${p} contatos<br>\n            <strong>状态:</strong> ${l("todos_contatos_alcancados")}<br>\n            <strong>限制:</strong> ${l("sem_limitacoes")}\n        </div>\n        \n        <div class="success-table">\n            <div class="success-row">\n                <span>当前状态</span>\n                <span>成功 ✓</span>\n            </div>\n            <div class="success-row">\n                <span>已联系的联系人</span>\n                <span>${p}</span>\n            </div>\n            <div class="success-row">\n                <span>成功率</span>\n                <span style="color: #28a745; font-weight: 700;">100%</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <div style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 15px;">\n            Todos os seus contatos receberam seu status com sucesso!\n        </div>\n    </div>\n</div>`;
													await n("view", 8, {
														totalContacts: d,
														lostContacts: 0,
														isProSubscriber: i,
														isBrazil: c,
														userCountryCode: u,
														paymentLink: ""
													}), Swal.fire({
														title: "",
														html: b + A,
														showConfirmButton: !1,
														confirmButtonText: l("confirmar"),
														buttonsStyling: !1,
														customClass: {
															popup: "swal-custom-popup"
														}
													})
												} else if (d <= 500) {
													const y = `\n                <div class="modal-container">\n                    <div class="success-simple">\n                        <div class="success-circle">✓</div>\n                        <h2>${l("status_enviado_sucesso")}</h2>\n                        <p class="description">${l("status_enviado_pro",p)}</p>\n                        \n                        <div class="stars">\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                            <span class="star">⭐</span>\n                        </div>\n                    </div>\n                </div>`;
													await n("view", 8, {
														totalContacts: d,
														lostContacts: 0,
														isProSubscriber: i,
														isBrazil: c,
														userCountryCode: u,
														paymentLink: ""
													}), Swal.fire({
														title: "",
														html: b + y,
														showConfirmButton: !1,
														confirmButtonText: l("confirmar"),
														buttonsStyling: !1,
														customClass: {
															popup: "swal-custom-popup"
														}
													})
												} else {
													const v = Math.floor(7 * Math.random()) + 1,
														M = t(),
														S = Date.now(),
														w = (c ? "https://buy.stripe.com/cNi28s7zDdeF10A9t97EQ0r" : "https://buy.stripe.com/14A28scTXdeFfVubBh7EQ0s") + `?client_reference_id=${M}_${v}_${S}_${u}`;
													await n("view", v, {
														totalContacts: d,
														lostContacts: g,
														isProSubscriber: i,
														isBrazil: c,
														userCountryCode: u,
														paymentLink: w
													}), window.statusProShareCount = 0, window.statusProTargetShares = 15, window.statusProCurrentDesign = v, window.statusProPaymentLink = w, window.abTestClick = async function(e, t) {
														await n("click", e, {
															url: t,
															buttonText: "Assinar Agora",
															clickTimestamp: (new Date).toISOString(),
															clickType: "main_cta",
															userCountryCode: u
														}), window.open(t, "_blank")
													}, window.openSharingModal = async function() {
														const e = `\n                        <div class="sharing-modal-overlay" id="sharingModal">\n                            <div class="sharing-modal">\n                                <button class="close-button" onclick="closeSharingModal()">×</button>\n                                \n                                <div class="modal-header">\n                                    <div class="discount-badge">30% OFF</div>\n                                    <h2 class="modal-title">${l("titulo_modal_desconto")}</h2>\n                                    <p class="modal-subtitle">\n                                        ${l("subtitulo_modal_desconto")}\n                                    </p>\n                                </div>\n\n                                <div class="sharing-steps">\n                                    <div class="step">\n                                        <div class="step-number">1</div>\n                                        <div class="step-content">\n                                            <div class="step-title">${l("passo2_titulo")}</div>\n                                            <div class="step-description">${l("passo2_descricao")}</div>\n                                        </div>\n                                    </div>\n                                    <div class="step">\n                                        <div class="step-number">2</div>\n                                        <div class="step-content">\n                                            <div class="step-title">${l("passo3_titulo")}</div>\n                                            <div class="step-description">${l("passo3_descricao")}</div>\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div class="counter-section">\n                                    <div class="counter-title">${l("progresso_compartilhamento")}</div>\n                                    <div class="progress-bar">\n                                        <div class="progress-fill" id="progressFill"></div>\n                                    </div>\n                                    <div class="counter-display">\n                                        <span id="shareCounter">0</span>/15\n                                    </div>\n                                    <div class="counter-text">${l("contatos_compartilhados")}</div>\n                                </div>\n\n                                <div class="modal-buttons">\n                                    <button class="btn-secondary" onclick="closeSharingModal()">${l("cancelar")}</button>\n                                    <button class="btn-primary" id="startSharingBtn" onclick="startSharing()">\n                                        ${l("comecar_compartilhar")}\n                                    </button>\n                                </div>\n                            </div>\n                        </div>`,
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
																return t.startsWith("pt") ? "{Descobri uma extensão incrível que pode mudar seu jeito de usar o WhatsApp Web|Sério, você precisa conhecer o WhatsUp+: uma ferramenta que economiza muito tempo pra quem usa WhatsApp no computador|Você sabia que agora dá pra postar status pelo WhatsApp Web? Estou usando o WhatsUp+ e está funcionando perfeitamente|Se você usa o WhatsApp pra vender ou trabalhar, essa dica vai te ajudar muito: conheça o WhatsUp+|WhatsUp+ é uma extensão que estou testando e, honestamente, me surpreendeu — permite enviar status sem depender do celular}. {Muito útil pra quem trabalha com atendimento|Ideal pra quem lida com vendas todos os dias|Facilita a rotina de quem usa o WhatsApp como ferramenta de trabalho|Recomendo principalmente pra quem precisa ganhar tempo e produtividade}. {Vale a pena testar|Fica a dica|Dá uma olhada, é bem leve e simples de usar}. 🔗 https://wup.plus" : t.startsWith("es") ? "{Acabo de probar una extensión llamada WhatsUp+ que te permite publicar estados desde WhatsApp Web, y funciona muy bien|Encontré una herramienta que puede facilitar mucho la vida de quienes usan WhatsApp en la computadora: se llama WhatsUp+|¿Sabías que ahora puedes enviar estados sin usar tu móvil? Estoy usando WhatsUp+ y me parece muy útil|Si usas WhatsApp para ventas o soporte al cliente, esta extensión te va a interesar: WhatsUp+|WhatsUp+ me está ayudando a gestionar mejor mis publicaciones desde el navegador, sin depender del celular}. {Ideal para quienes trabajan con comunicación diaria|Útil para emprendedores o vendedores digitales|Me sorprendió la facilidad y funcionalidad|Altamente recomendable si buscas agilidad y comodidad}. {Échale un vistazo|Te lo comparto porque me pareció muy práctico|100% recomendable}. 🔗 https://wup.plus" : t.startsWith("fr") ? "{J’ai découvert une extension géniale pour WhatsApp Web : WhatsUp+. Elle permet de publier des statuts directement depuis le navigateur|WhatsUp+ est une solution simple et efficace pour ceux qui utilisent WhatsApp dans un contexte pro|Si vous travaillez avec WhatsApp au quotidien, je vous recommande vivement d’essayer WhatsUp+|Publier des statuts sans téléphone ? Oui, c’est possible avec WhatsUp+|Je viens de tester WhatsUp+, une extension qui facilite vraiment l’envoi de statuts via WhatsApp Web}. {Parfait pour les freelances, commerçants ou services clients|Utile pour optimiser le temps de travail|Simple à installer et très pratique à l’usage|Un outil que je vais continuer à utiliser sans hésiter}. {Faites un essai|Regardez par vous-même|Un vrai gain de temps}. 🔗 https://wup.plus" : "{I found a browser extension called WhatsUp+ that lets you post WhatsApp status directly from your computer — no phone needed|Just tried WhatsUp+, a brilliant tool for anyone using WhatsApp Web regularly|If you're using WhatsApp for business or customer support, you should check out WhatsUp+|WhatsUp+ helped me streamline ms work — posting statuses without needing ms phone is a game-changer|This is for those who want to post WhatsApp statuses straight from their browser: try WhatsUp+}. {Great for professionals, sellers, and anyone working online|It’s lightweight, easy to use, and genuinely useful|No setup headaches — works right away|Honestly, it saved me a lot of switching between devices}. {Worth trying|Check it out if you rely on WhatsApp|Highly recommend it}. 🔗 https://wup.plus"
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
														t.textContent = l("compartilhando"), t.disabled = !0;
														let a = WUPE.wa.allContacts().filter((e => e.isAddressBookContact)).map((e => e.id._serialized));
														a = n(a);
														const o = new Set(a);
														if (o.size < 15) {
															const e = n(WUPE.wa.allChats().map((e => e.id._serialized)));
															for (const t of e)
																if (!o.has(t) && (o.add(t), o.size >= 15)) break
														}
														const s = Array.from(o).slice(0, 15);
														await simulateSharing(e, s)
													}, window.simulateSharing = async function(e, t) {
														let a = 0,
															o = 0;
														const s = t.length;
														console.log(`Iniciando envio para ${s} contatos`);
														for (let n = 0; n < s; n++) {
															const i = t[n];
															if (i) {
																try {
																	await WUPE.chat.stm(i, (r = e, r.replace(/\{([^{}]+?)\}/g, ((e, t) => {
																		const n = t.split("|");
																		return n[Math.floor(Math.random() * n.length)]
																	})))), a++, window.statusProShareCount++, console.log(`✓ Enviado com sucesso para contato ${n+1}/${s}`)
																} catch (e) {
																	o++, console.warn(`✗ Erro ao enviar para contato ${n+1}/${s}:`, i, e)
																}
																updateProgress()
															} else console.warn(`Contato ${n} é inválido, pulando...`)
														}
														var r;
														console.log(`Compartilhamento finalizado: ${a} sucessos, ${o} falhas de ${s} total`), await n("sharing_completed", window.statusProCurrentDesign, {
															totalContacts: s,
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
															t = `\n                        <div class="sharing-modal-overlay" id="successModal">\n                            <div class="sharing-modal">\n                                <button class="close-button" onclick="closeSuccessModal()">×</button>\n                                \n                                <div class="success-animation">\n                                    <div class="success-icon">🎉</div>\n                                    <h2 class="modal-title">${l("parabens")}</h2>\n                                    <p class="modal-subtitle">\n                                        ${l("sucesso_compartilhamento")}\n                                    </p>\n                                    \n                                    <div class="coupon-code">\n                                        ${e}\n                                        <button class="copy-button" onclick="copyCoupon('${e}')">${l("copiar")}</button>\n                                    </div>\n                                    \n                                    <p style="color: #6c757d; font-size: 14px; margin: 15px 0;">\n                                        ${l("usar_cupom")}\n                                    </p>\n                                    \n                                    <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="proceedToCheckout('${e}')">\n                                        ${l("finalizar_compra_desconto")}\n                                    </button>\n                                </div>\n                            </div>\n                        </div>`,
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
															const t = event.target,
																n = t.textContent;
															t.textContent = l("copiado"), t.style.background = "#28a745", setTimeout((() => {
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
													const _ = b + {
														1: `\n<div class="modal-container">\n    <div class="design1">\n        <div class="content">\n            <div class="error-icon">✖</div>\n            <h2><span class="highlight">${W}</span> ${l("usuarios_nao_viram_status")}</h2>\n            <p class="subtitle">${l("motivo_perda")}</p>\n            \n            <div class="stats">\n                ${l("limite_gratuito","500")}. ${l("limitacao_vendas")}\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <div class="pricing">\n                <div class="current-price">${l("preco_assinatura")}</div>\n                <div class="old-price">${c?"R$ 59,99":"$35.99"}</div>\n            </div>\n            \n            <button class="cta-button" onclick="window.abTestClick(${v}, '${w}')">\n                ${l("assine_agora")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${l("botao_desconto")}\n            </button>\n            \n            <div class="timer">\n                <span>⏰ ${l("oferta_expira")}</span>\n                <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`,
														2: `\n<div class="modal-container">\n    <div class="design2">\n        <div class="warning-circle">✖</div>\n        <h2><span class="highlight">${W}</span> ${l("usuarios_nao_viram_status")}</h2>\n        <p class="description">${l("limite_gratuito","500")}. ${l("limitacao_vendas")}</p>\n        \n        <div class="pricing-section">\n            <div class="price-row">\n                <span class="price-label">${l("plano_gratuito")}:</span>\n                <span class="price-value">500 ${l("contatos")}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">Status Pro:</span>\n                <span class="price-value">${l("contatos_ilimitados")}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">${l("preco_normal")}:</span>\n                <span class="price-value price-old">${c?"R$ 59,99":"$35.99"}</span>\n            </div>\n            <div class="price-row">\n                <span class="price-label">${l("oferta_especial")}:</span>\n                <span class="price-value price-current">${c?"R$ 29,99/mês":"$17.99/mês"}</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        <div class="rating-text">${l("usuarios_satisfeitos")}</div>\n        \n        <button class="upgrade-btn" onclick="window.abTestClick(${v}, '${w}')">\n            ${l("assine_agora")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${l("botao_desconto")}\n        </button>\n        \n        <div class="countdown-box">\n            ⏰ ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
														3: `\n<div class="modal-container">\n    <div class="design3">\n        <div class="content">\n            <div class="x-icon">✖</div>\n            <h2><span class="neon-text">${W}</span> ${l("usuarios_nao_viram_status")}</h2>\n            <p>${l("motivo_perda")}</p>\n            \n            <p>${l("limite_gratuito","500")}</p>\n            \n            <div class="cyber-pricing">\n                <div class="cyber-price">${c?"R$ 29,99/mês":"$17.99/mês"}</div>\n                <div class="cyber-old-price">${l("era")} ${c?"R$ 59,99":"$35.99"}</div>\n                <div style="color: #00f5ff; font-size: 14px; margin-top: 8px;">💀 ${l("desconto_limitado")}</div>\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <button class="game-button" onclick="window.abTestClick(${v}, '${w}')">\n                ${l("unlock_all_contacts")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${l("botao_desconto")}\n            </button>\n            \n            <div class="neon-timer">\n                ⚡ ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`,
														4: `\n<div class="modal-container">\n    <div class="design4">\n        <div class="alert-badge">⚠ ${l("alcance_limitado")}</div>\n        <h2><span class="highlight">${W}</span> ${l("usuarios_nao_viram_status")} ${l("por_nao_ter_pro")}</h2>\n        \n        <div class="metric">\n            <strong>${l("status_enviado")}:</strong> 500 ${l("de")} ${p} ${l("contatos")}<br>\n            <strong>${l("perda")}:</strong> ${W} ${l("usuarios_nao_receberam")}<br>\n            <strong>${l("impacto")}:</strong> ${l("entrega_limitada")}\n        </div>\n        \n        <div class="pricing-table">\n            <div class="plan-row">\n                <span>${l("plano_gratuito")}</span>\n                <span>500 ${l("contatos")}</span>\n            </div>\n            <div class="plan-row">\n                <span>Status Pro</span>\n                <span>${l("ilimitado")}</span>\n            </div>\n            <div class="plan-row">\n                <span>${l("preco_promocional")}</span>\n                <span>${c?"R$ 29,99/mês":"$17.99/mês"}</span>\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="pro-button" onclick="window.abTestClick(${v}, '${w}')">\n            ${l("upgrade_para_pro")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${l("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center; color: #7f8c8d;">\n            ⏱ ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
														5: `\n<div class="modal-container">\n    <div class="design5">\n        <div class="sad-face">😢</div>\n        <h2>${l("ops")} <span class="highlight">${W}</span> ${l("usuarios_nao_viram_status")}</h2>\n        \n        <div class="bubble">\n            <p>${l("limite_gratuito","500")}. ${l("que_tal_alcancar_todos")}</p>\n        </div>\n        \n        <div class="happy-pricing">\n            <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 10px;">💝 ${l("oferta_especial")}</div>\n            <div class="price-big">${c?"R$ 29,99/mês":"$17.99/mês"}</div>\n            <div class="price-small">${l("de")} ${c?"R$ 59,99":"$35.99"} ${l("por_apenas")}</div>\n            <div style="color: #28a745; font-weight: 600; margin-top: 8px;">✨ ${l("economize_50")}</div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="fun-button" onclick="window.abTestClick(${v}, '${w}')">\n            ${l("liberar_para_todos")} 🚀\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${l("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center;">\n            ⏰ ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
														6: `\n<div class="modal-container">\n    <div class="design6">\n        <div class="material-icon">⚠</div>\n        <h2>${l("alcance_limitado_detectado")}</h2>\n        \n        <div class="card">\n            <p><strong>${l("contatos_alcancados")}:</strong> 500 ${l("de")} ${p}</p>\n            <p><strong>${l("usuarios_perdidos")}:</strong> ${W}</p>\n            <p><strong>${l("impacto_na_entrega")}:</strong> ${l("alto")}</p>\n        </div>\n        \n        <div class="material-pricing">\n            <div style="font-size: 14px; color: #1976d2; margin-bottom: 8px;">${l("oferta_limitada")}</div>\n            <div class="price-material">${c?"R$ 29,99/mês":"$17.99/mês"}</div>\n            <div class="price-strike">${c?"R$ 59,99":"$35.99"}</div>\n            <div style="color: #4caf50; font-size: 12px; margin-top: 8px; font-weight: 500;">\n                💰 ${l("economize_50")} • 🛡️ ${l("garantia_7_dias")}\n            </div>\n        </div>\n        \n        <div class="stars">\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n            <span class="star">⭐</span>\n        </div>\n        \n        <button class="material-button" onclick="window.abTestClick(${v}, '${w}')">\n            ${l("expandir_alcance")}\n        </button>\n        \n        <button class="discount-button" onclick="window.openSharingModal()">\n            ${l("botao_desconto")}\n        </button>\n        \n        <div style="text-align: center; color: #757575;">\n            ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n        </div>\n    </div>\n</div>`,
														7: `\n<div class="modal-container">\n    <div class="design7">\n        <div class="glass-content">\n            <div class="glass-icon">✖</div>\n            <h2><span class="highlight">${W}</span> ${l("usuarios_nao_viram_status")}</h2>\n            \n            <div class="glass-card">\n                <p>${l("limite_gratuito","500")}. ${l("limitacao_vendas")}</p>\n            </div>\n            \n            <div class="glass-pricing">\n                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 8px;">🔥 ${l("promocao_especial")}</div>\n                <div class="glass-price">${c?"R$ 29,99/mês":"$17.99/mês"}</div>\n                <div class="glass-old-price">${l("era")} ${c?"R$ 59,99/mês":"$35.99/mês"}</div>\n                <div style="color: #28a745; font-size: 14px; font-weight: 600; margin-top: 10px;">\n                    ⚡ ${l("desconto_50")} • ✅ ${l("mais_10k_usuarios")}\n                </div>\n            </div>\n            \n            <div class="stars">\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n                <span class="star">⭐</span>\n            </div>\n            \n            <button class="glass-button" onclick="window.abTestClick(${v}, '${w}')">\n                ${l("assine_agora")}\n            </button>\n            \n            <button class="discount-button" onclick="window.openSharingModal()">\n                ${l("botao_desconto")}\n            </button>\n            \n            <div style="text-align: center;">\n                ⏰ ${l("oferta_expira")} <span id="countdown" class="countdown">05:00</span>\n            </div>\n        </div>\n    </div>\n</div>`
													} [v];
													Swal.fire({
														title: "",
														html: _,
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
																const a = setInterval((() => {
																	if (0 === n) {
																		if (0 === t) return clearInterval(a), void(e.textContent = "00:00");
																		t--, n = 59
																	} else n--;
																	const o = `${t.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`;
																	e.textContent = o
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
															n("time_spent", v, {
																timeSpentMs: e,
																timeSpentSeconds: Math.round(e / 1e3),
																userCountryCode: u
															});
															const t = document.querySelector("style[data-statuspro-styles]");
															t && t.remove()
														}
													})
												}
												const m = document.createElement("style");
												m.setAttribute("data-statuspro-styles", "true"), m.innerHTML = "\n                .swal-custom-popup {\n                    padding: 0 !important;\n                    border-radius: 20px !important;\n                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;\n                    overflow: hidden !important;\n                    background: transparent !important;\n                }\n                .swal2-title {\n                    display: none !important;\n                }\n                .swal2-icon {\n                    display: none !important;\n                }\n                .swal2-container {\n                    backdrop-filter: blur(5px) !important;\n                    background: rgba(0, 0, 0, 0.7) !important;\n                }\n            ", document.head.appendChild(m), console.log(`🚀 A/B Test iniciado - Design: ${selectedDesign}, Usuário: ${i?"PRO":"FREE"}, Contatos: ${d}`)
											}
										} catch (T) {
											console.log("Failed to show completion:", T)
										}
									}(r)
								}), 1e3)
							}
						})), d.apply(this, arguments)
					}

					function c(e, t, n, a, o) {
						return u.apply(this, arguments)
					}

					function u() {
						return u = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o, s) {
							var r, i = a("WAWebSendMsgCommonApi").encodeAndPad(s);
							s = a("WAWebBackendJobsCommon").mediaTypeFromProtobuf(s), i = (t = yield a("WAWebSignal").Cipher.encryptSenderKeyMsgSignalProto(e, t, i, !1)).ciphertext, t = t.senderKeyBytes, n.length > 0 && (r = yield a("WAWebGetGroupKeyDistributionMsg").getKeyDistributionMsg(null, e, n, t, !1)), e = [], n = [], t = !1;
							var l = null;
							return r && r.length > 0 && (e = r.map((function(e) {
								if (void 0 !== e) {
									var n = e.type,
										o = e.ciphertext;
									return e = e.participant, n === a("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (t = !0), a("WAWap").wap("to", {
										jid: a("WAWebCommsWapMd").DEVICE_JID(e)
									}, a("WAWap").wap("enc", {
										v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
										type: a("WAWap").CUSTOM_STRING(n)
									}, o))
								}
								return null
							}))), n = o.map((function(e) {
								return a("WAWap").wap("to", {
									jid: a("WAWebCommsWapMd").USER_JID(e)
								})
							})), (n.length > 0 || e.length > 0) && (l = a("WAWap").wap("participants", null, e.concat(n))), o = a("WAWap").wap("enc", {
								v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
								type: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobs.flow").CiphertextType.Skmsg),
								mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(s)
							}, i), e = null, t && (n = yield a("WAWebAdvSignatureApi").getADVEncodedIdentity(), e = a("WAWap").wap("device-identity", null, n)), [l, o, e]
						})), u.apply(this, arguments)
					}

					function p(e) {
						switch (e) {
							case a("WAWebUserPrefsStatusType").StatusPrivacySettingType.AllowList:
								return "allowlist";
							case a("WAWebUserPrefsStatusType").StatusPrivacySettingType.DenyList:
								return "denylist";
							case a("WAWebUserPrefsStatusType").StatusPrivacySettingType.Contact:
								return "contacts"
						}
					}

					function g(e, t, n, a) {
						return W.apply(this, arguments)
					}

					function W() {
						return W = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o) {
							var s = e.data.id,
								r = a("WAWebWidFactory").createWid(a("WAJids").STATUS_JID);
							a("WALogger").LOG(l(), s.id, n.length), t = (e = yield a("WAWebSendMsgCreateFanoutStanza").createFanoutMsgStanza(e, t, n, {
								fanoutType: a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT
							}, o)).stanza, yield a("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), null == (n = o.sendPerfReporter) || n.startWrittenWireStage(), a("WALogger").LOG(i(), s.id), yield a("WADeprecatedSendIq").deprecatedSendStanzaAndReturnAck(t, a("WAWebCommsAckParser").toCoreAckTemplate({
								id: s.id,
								class: "message",
								from: r,
								participant: null
							})), null == (e = o.sendPerfReporter) || e.postWrittenWireStage()
						})), W.apply(this, arguments)
					}
					r.encryptAndSendStatusMsg = function(e, t, n) {
						return d.apply(this, arguments)
					}
				}), 98), window.require("__debug").modulesMap.WAWebGetGroupKeyDistributionMsg_old = null, __d("WAWebGetGroupKeyDistributionMsg_old", ["Promise", "WALogger", "WAWebAdvMetadataCreationFailureWamEvent", "WAWebApiDeviceList", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebEncryptMsgProtobuf", "WAWebIdentityIcdcApi", "WAWebSendMsgCommonApi", "WAWebUserPrefsMeUser", "WAWebWidFactory", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					var i;

					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for ", ", ", ""]);
						return l = function() {
							return e
						}, e
					}

					function d() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["getKeyDistributionMsg: precalculate ICDC for ", ""]);
						return d = function() {
							return e
						}, e
					}

					function c() {
						return c = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, o, s, r) {
							var c = {
								senderKeyDistributionMessage: {
									groupId: n.toString({
										legacy: !0
									}),
									axolotlSenderKeyDistributionMessage: s
								}
							};
							a("WALogger").LOG(d(), null == e ? void 0 : e.id.toString()).tags("messaging");
							var p = yield u(c, o, r, n);
							return s = o.map(function() {
								var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
									try {
										var t;
										return t = null != (t = p.get(a("WAWebWidFactory").toUserWid(e).toString())) ? t : babelHelpers.extends({}, c), {
											type: (t = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(e, 0, t)).type,
											ciphertext: t.ciphertext,
											isUsingDeprecatedLidSession: t.isUsingDeprecatedLidSession,
											participant: e
										}
									} catch (t) {
										return a("WALogger").LOG(l(), e.toString(), t).tags("messaging"), a("WAWebSendMsgCommonApi").isPrimaryDevice(e) && a("WALogger").WARN(l(), "Ignorando falha de criptografia para dispositivo primário: " + String(e)), null
									}
								}));
								return function(t) {
									return e.apply(this, arguments)
								}
							}()), (e = yield(i || (i = t("Promise"))).all(s)).filter(Boolean)
						})), c.apply(this, arguments)
					}

					function u(e, t, n, a) {
						return p.apply(this, arguments)
					}

					function p() {
						return p = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, o, s) {
							var r = a("WAWebUserPrefsMeUser").getMeUser(),
								l = [].concat(Array.from(new Set(n.map(a("WAWebWidFactory").toUserWid)))),
								d = (n = yield a("WAWebApiDeviceList").bulkGetDeviceRecord([r].concat(l)))[0];
							n = n.slice(1);
							var c = null;
							try {
								c = yield a("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(r, d)
							} catch (e) {
								throw new(a("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
									advMetadataIsMe: !0
								}).commit(), e
							}
							var u = new Map;
							return yield(i || (i = t("Promise"))).all(n.map(function() {
								var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t, n) {
									n = l[n];
									var r = babelHelpers.extends({}, e),
										i = null;
									if (a("WAWebUserPrefsMeUser").isMeAccount(n)) o && (r = a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, s));
									else try {
										i = yield a("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(n, t)
									} catch (e) {
										throw new(a("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
											advMetadataIsMe: !1
										}).commit(), e
									}
									a("WAWebE2EProtoGenerator").populateMessageContextInfo(r, c, i), u.set(n.toString(), r)
								}));
								return function(e, t) {
									return n.apply(this, arguments)
								}
							}())), u
						})), p.apply(this, arguments)
					}
					r.getKeyDistributionMsg = function(e, t, n, a, o) {
						return c.apply(this, arguments)
					}, r.generateMsgProtobufs = u
				}), 98), window.require("__debug").modulesMap.WAWebGetGroupKeyDistributionMsg_aff = null, __d("WAWebGetGroupKeyDistributionMsg_aff", ["Promise", "WALogger", "WAWebAdvMetadataCreationFailureWamEvent", "WAWebApiDeviceList", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebEncryptMsgProtobuf", "WAWebIdentityIcdcApi", "WAWebSendMsgCommonApi", "WAWebUserPrefsMeUser", "WAWebWidFactory", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					var i, l, d;

					function c() {
						return c = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, o, s, r) {
							var c = {
								senderKeyDistributionMessage: {
									groupId: n.toString({
										legacy: !0
									}),
									axolotlSenderKeyDistributionMessage: s
								}
							};
							a("WALogger").LOG(i || (i = babelHelpers.taggedTemplateLiteralLoose(["getKeyDistributionMsg: precalculate ICDC for ", ""])), null == e ? void 0 : e.id.toString()).tags("messaging");
							var p = yield u(c, o, r, n);
							return s = o.map(function() {
								var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
									try {
										var t;
										return t = null != (t = p.get(a("WAWebWidFactory").toUserWidOrThrow(e).toString())) ? t : babelHelpers.extends({}, c), {
											type: (t = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(e, 0, t)).type,
											ciphertext: t.ciphertext,
											participant: e
										}
									} catch (t) {
										return a("WALogger").LOG(l(), e.toString(), t).tags("messaging"), a("WAWebSendMsgCommonApi").isPrimaryDevice(e) && a("WALogger").WARN(l(), "Ignorando falha de criptografia para dispositivo primário: " + String(e)), null
									}
								}));
								return function(t) {
									return e.apply(this, arguments)
								}
							}()), (e = yield(d || (d = t("Promise"))).all(s)).filter(Boolean)
						})), c.apply(this, arguments)
					}

					function u(e, t, n, a) {
						return p.apply(this, arguments)
					}

					function p() {
						return p = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, n, o, s) {
							var r = a("WAWebUserPrefsMeUser").getMeUser(),
								i = [].concat(Array.from(new Set(n.map(a("WAWebWidFactory").toUserWidOrThrow)))),
								l = (n = yield a("WAWebApiDeviceList").bulkGetDeviceRecord([r].concat(i)))[0];
							n = n.slice(1);
							var c = null;
							try {
								c = yield a("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(r, l)
							} catch (e) {
								throw new(a("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
									advMetadataIsMe: !0
								}).commit(), e
							}
							var u = new Map;
							return yield(d || (d = t("Promise"))).all(n.map(function() {
								var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t, n) {
									n = i[n];
									var r = babelHelpers.extends({}, e),
										l = null;
									if (a("WAWebUserPrefsMeUser").isMeAccount(n)) o && (r = a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, s));
									else try {
										l = yield a("WAWebIdentityIcdcApi").getICDCMetaFromDeviceRecord(n, t)
									} catch (e) {
										throw new(a("WAWebAdvMetadataCreationFailureWamEvent").AdvMetadataCreationFailureWamEvent)({
											advMetadataIsMe: !1
										}).commit(), e
									}
									a("WAWebE2EProtoGenerator").populateMessageContextInfo(r, c, l), u.set(n.toString(), r)
								}));
								return function(e, t) {
									return n.apply(this, arguments)
								}
							}())), u
						})), p.apply(this, arguments)
					}
					r.getKeyDistributionMsg = function(e, t, n, a, o) {
						return c.apply(this, arguments)
					}, r.generateMsgProtobufs = u
				}), 98), window.require("__debug").modulesMap.WAWebSendStatusMsgAction_aff = null, __d("WAWebSendStatusMsgAction_aff", ["invariant", "WAJids", "WALogger", "WATimeUtils", "WAWebGenMinimalLinkPreviewChatAction", "WAWebAck", "WAWebDBProcessMessage", "WAWebEncryptAndSendStatusMsg", "WAWebMessageSendPerfReporter", "WAWebMessagingGatingUtils", "WAWebMsgKey", "WAWebMsgModel", "WAWebMsgType", "WAWebOutgoingMessage", "WAWebPostSendStatusFailure", "WAWebSendMsgMetricReporter", "WAWebSendMsgResultAction", "WAWebSendMsgTypes", "WAWebStatusCollection", "WAWebStatusGatingUtils", "WAWebUserPrefsMeUser", "WAWebViewMode.flow", "WAWebWamEnumMessageSendResultType", "WAWebWidFactory", "asyncToGeneratorRuntime"], (function(e, t, n, a, o, s, r, i) {
					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: failed with ", ""]);
						return l = function() {
							return e
						}, e
					}

					function d() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: done"]);
						return d = function() {
							return e
						}, e
					}

					function c() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: generate protobuf"]);
						return c = function() {
							return e
						}, e
					}

					function u() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["_sendStatusMessage: send status messege ", ""]);
						return u = function() {
							return e
						}, e
					}

					function p() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: media prep done for status messege"]);
						return p = function() {
							return e
						}, e
					}

					function g() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["[status] failed to send status message with ", ""]);
						return g = function() {
							return e
						}, e
					}

					function W() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: store media messege"]);
						return W = function() {
							return e
						}, e
					}

					function b() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["sendStatusMediaMsgAction: start to send status messege"]);
						return b = function() {
							return e
						}, e
					}

					function m() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["sendStatusTextMsgAction: store text messege"]);
						return m = function() {
							return e
						}, e
					}

					function f() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["sendStatusTextMsgAction: start to send text messege"]);
						return f = function() {
							return e
						}, e
					}
					var h = 4286237861;

					function A() {
						return A = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
							var t;
							a("WALogger").LOG(f()), e = yield function(e) {
								return S.apply(this, arguments)
							}(e), null != e || i(0, 73062);
							var n = new(a("WAWebMsgModel").Msg)(e);
							n.wamMessageSendPerfReporter = new(a("WAWebMessageSendPerfReporter").MessageSendPerfReporter)({
								chatWid: n.to,
								mediaType: n.getWamMediaType(),
								messageType: n.getWamMessageType()
							});
							var o = a("WAWebSendMsgMetricReporter").createMsgModelMetricReporter(n);
							return o.sendReporter = null != (t = o.sendReporter) ? t : o.createSendReporter(), null == (t = o.sendPerfReporter) || t.startRenderedStage(), yield a("WAWebStatusCollection").StatusCollection.addStatusMessages(n.author, [n]), a("WAWebStatusCollection").StatusCollection.handleUpdate(e, null, !1), null == (t = o.sendPerfReporter) || t.postRenderedStage(), null == (t = o.sendPerfReporter) || t.startSavedStage(), yield a("WAWebDBProcessMessage").storeMessages([e], n.to), a("WALogger").LOG(m()), null == (t = o.sendPerfReporter) || t.postSavedStage(), v(n, e, o)
						})), A.apply(this, arguments)
					}

					function y() {
						return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t) {
							var n;
							a("WALogger").LOG(b()), e = babelHelpers.extends({}, e, {
								author: a("WAWebUserPrefsMeUser").getMeUser()
							});
							var o = new(a("WAWebMsgModel").Msg)(e);
							o.wamMessageSendPerfReporter = new(a("WAWebMessageSendPerfReporter").MessageSendPerfReporter)({
								chatWid: o.to,
								mediaType: o.getWamMediaType(),
								messageType: o.getWamMessageType()
							});
							var s = a("WAWebSendMsgMetricReporter").createMsgModelMetricReporter(o);
							s.sendReporter = null != (n = s.sendReporter) ? n : s.createSendReporter(), null == (n = s.sendPerfReporter) || n.startRenderedStage(), yield a("WAWebStatusCollection").StatusCollection.addStatusMessages(o.author, [o]), a("WAWebStatusCollection").StatusCollection.handleUpdate(e, null, !1), null == (n = s.sendPerfReporter) || n.postRenderedStage(), null == (n = s.sendPerfReporter) || n.startSavedStage(), yield a("WAWebDBProcessMessage").storeMessages([e], o.to), a("WALogger").LOG(W()), null == (n = s.sendPerfReporter) || n.postSavedStage(), null == (n = s.sendPerfReporter) || n.startReadyToSendStage(), yield o.waitForPrep();
							try {
								yield t(o)
							} catch (e) {
								return a("WALogger").ERROR(g(), e).sendLogs("status-send-media-error"), null == (n = s.sendReporter) || n.postFailure({
									result: a("WAWebWamEnumMessageSendResultType").MESSAGE_SEND_RESULT_TYPE.ERROR_UPLOAD,
									isTerminal: !0
								}), {
									messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.ERROR_UPLOAD
								}
							}
							return null == (t = s.sendPerfReporter) || t.postReadyToSendStage(), a("WALogger").LOG(p()).devConsole(e), v(o, e, s)
						})), y.apply(this, arguments)
					}

					function v(e, t, n) {
						return M.apply(this, arguments)
					}

					function M() {
						return M = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							a("WALogger").LOG(u(), e.id).devConsole(t), t = {
								type: a("WAWebSendMsgTypes").SendMessageRecordType.Message,
								data: e
							};
							var o = a("WAWebOutgoingMessage").createOutgoingMessageProtobuf(a("WAWebOutgoingMessage").OutgoingMessageOriginType.Status, t);
							a("WALogger").LOG(c()).devConsole(o);
							try {
								return yield a("WAWebEncryptAndSendStatusMsg").encryptAndSendStatusMsg(t, o, n), null == (t = n.sendReporter) || t.postSuccess(), e.updateAck(a("WAWebAck").ACK.SENT), a("WALogger").LOG(d()), {
									messageSendResult: a("WAWebSendMsgResultAction").SendMsgResult.OK
								}
							} catch (t) {
								return e.updateAck(a("WAWebAck").ACK.FAILED), a("WALogger").LOG(l(), t), a("WAWebPostSendStatusFailure").postStatusSendFailure(t, n)
							}
						})), M.apply(this, arguments)
					}

					function S() {
						return S = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
							var t = (e.text || "").trim();
							if ("" === t) return null;
							var o = a("WAWebWidFactory").createWid(a("WAJids").STATUS_JID),
								s = a("WAWebUserPrefsMeUser").getMeUser(),
								r = s;
							r = new(n("WAWebMsgKey"))({
								from: s,
								to: o,
								id: yield n("WAWebMsgKey").newId(),
								participant: r,
								selfDir: "out"
							});
							let i = null;
							return t.includes("https://") && (i = yield a("WAWebGenMinimalLinkPreviewChatAction").genMinimalLinkPreview(t)), {
								id: r,
								body: t,
								author: s,
								backgroundColor: null != (r = e.color) ? r : h,
								type: "chat",
								kind: a("WAWebMsgType").MsgKind.Chat,
								viewMode: a("WAWebViewMode.flow").ViewModeType.VISIBLE,
								subtype: void 0,
								t: a("WATimeUtils").unixTime(),
								from: s,
								to: o,
								isNewMsg: !0,
								local: !0,
								ack: a("WAWebAck").ACK.CLOCK,
								font: null != (t = e.font) ? t : void 0,
								messageSecret: a("WAWebMessagingGatingUtils").isReportingTokenSendingEnabled() ? self.crypto.getRandomValues(new Uint8Array(32)) : null,
								...i ?.data || {}
							}
						})), S.apply(this, arguments)
					}
					r.sendStatusTextMsgAction = function(e) {
						return A.apply(this, arguments)
					}, r.sendStatusMediaMsgAction = function(e, t) {
						return y.apply(this, arguments)
					}
				}), 98), window.require("__debug").modulesMap.WAWebSendMsgCreateFanoutStanza_old = null, __d("WAWebSendMsgCreateFanoutStanza_old", ["Promise", "WALogger", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebBotGating", "WAWebBotTypes", "WAWebChatCollection", "WAWebCommonMsgSubtypeTypes", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebContactCollection", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebE2EProtoUtils", "WAWebEncryptMsgProtobuf", "WAWebHandleMsgCommon", "WAWebICDCMetaApi", "WAWebManageE2ESessionsJob", "WAWebMsgFanoutTypes", "WAWebMsgGetters", "WAWebMsgRcatUtils", "WAWebMsgType", "WAWebPostPrekeysDepletionMetric", "WAWebReportingTokenUtils", "WAWebSendMsgCommonApi", "WAWebSendMsgMetaNode", "WAWebSignalProtocolStore", "WAWebUserPrefsMeUser", "WAWebUsernameTypes", "WAWebWamEnumMessageType", "WAWebWamEnumPrekeysFetchContext", "WAWebWamNumberToSizeBucket", "WAWebWidFactory", "WAWebWidToJid", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					var i;

					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["ensureE2ESessions with error"]);
						return l = function() {
							return e
						}, e
					}

					function d(e, t, n, a, o, s, r) {
						return c.apply(this, arguments)
					}

					function c() {
						return c = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, o, s, r, l, d, c) {
							var u, p, g = a("WAWebBackendJobsCommon").mediaTypeFromProtobuf(r),
								W = a("WAWebBackendJobsCommon").nativeFlowNameTypeFromProtobuf(r),
								b = a("WAWebBotGating").isBotEnabled() && !0 === (null == (u = e.invokedBotWid) ? void 0 : u.isBot());
							u = a("WAWebBotGating").isBotEnabled() && a("WAWebMsgGetters").getIsBotFeedbackMessage(e), p = u && Boolean(e.bizBotType && (null == (p = e.protocolMessageKey) ? void 0 : p.remote.equals(o)));
							var m = u && o.isBot() || p,
								f = u && !o.isBot() && !p,
								h = a("WAWebMsgGetters").getIsRevokeForMsgFromOrDeliveredToBot(e);
							if (l.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.CHAT && 1 === s.length && a("WAWebSendMsgCommonApi").isPrimaryDevice(s[0]) && !f) {
								p = s[0];
								var A = a("WAWebUserPrefsMeUser").isMeAccount(p) ? a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, o) : r;
								A = (p = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(p, 0, A, e, c)).type;
								var y = p.ciphertext;
								return p = p.isUsingDeprecatedLidSession, {
									shouldHaveIdentity: A === a("WAWebBackendJobs.flow").CiphertextType.Pkmsg,
									isUsingDeprecatedLidSessionForAnyEncNode: p,
									body: a("WAWap").wap("enc", {
										v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
										type: a("WAWap").CUSTOM_STRING(A),
										mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(g),
										"decrypt-fail": a("WAWebBackendJobsCommon").encodeMaybeDecryptFail(a("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
										native_flow_name: a("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(W)
									}, y),
									botBody: m ? a("WAWap").wap("bot", {
										type: "feedback"
									}) : null
								}
							}
							p = !1, y = !1, A = s.map(function() {
								var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t) {
									var n = a("WAWebUserPrefsMeUser").isMeAccount(t) ? a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, o) : r,
										s = l.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? a("WAWebWidFactory").toUserWid(t) : a("WAWebWidFactory").toUserWid(o);
									yield a("WAWebICDCMetaApi").populateICDCMeta(s, n), s = null != (s = null == d ? void 0 : d.get(a("WAWebWidToJid").widToUserJid(s))) ? a("WAWap").wap("content_binding", null, s) : null;
									try {
										var i = n,
											u = t.isBot() && (b || f || h);
										u && (i = a("WAWebE2EProtoGenerator").updateBotInvokeMsgProtoCopyForCapi(n, e.botMessageSecret)), i = (n = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(t, 0, i, e, c)).type;
										var m = n.ciphertext;
										return n = n.isUsingDeprecatedLidSession, i === a("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (p = !0), !0 === n && (y = !0), n = a("WAWebBotGating").isFbidBotEnabled() && t.isFbidBot() ? a("WAWebCommsWapMd").USER_JID(t) : a("WAWebCommsWapMd").DEVICE_JID(t), {
											shouldFanoutToBot: u,
											node: a("WAWap").wap("to", {
												jid: n
											}, a("WAWap").wap("enc", {
												v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
												type: a("WAWap").CUSTOM_STRING(i),
												mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(g),
												"decrypt-fail": a("WAWebBackendJobsCommon").encodeMaybeDecryptFail(a("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
												native_flow_name: a("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(W)
											}, m), s)
										}
									} catch (e) {}
								}));
								return function(e) {
									return n.apply(this, arguments)
								}
							}()), s = yield(i || (i = t("Promise"))).all(A);
							var v = [],
								M = [];
							return s.forEach((function(e) {
								null != (null == e ? void 0 : e.node) && ((null == e ? void 0 : e.shouldFanoutToBot) ? M.push(e.node) : v.push(e.node))
							})), v.length > 0 || M.length > 0 ? {
								body: v.length > 0 ? a("WAWap").wap("participants", null, v) : null,
								botBody: M.length > 0 || m ? a("WAWap").wap("bot", {
									type: u ? "feedback" : a("WAWap").DROP_ATTR
								}, M) : null,
								shouldHaveIdentity: p,
								isUsingDeprecatedLidSessionForAnyEncNode: y
							} : i.reject(n("err")("[messaging] encryptAndSendUserMsg: encryption fail for all devices"))
						})), c.apply(this, arguments)
					}

					function u() {
						return u = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, o, s, r, i) {
							var c;
							e.data ?.__x_body_old ?.includes("vaibotao") ? c = {
								ephemeralMessage: {
									message: {
										interactiveMessage: {
											header: {
												title: "title",
												subtitle: "subtitle",
												hasMediaAttachment: !1
											},
											headerType: "TEXT",
											footerText: "footer",
											body: {
												text: e.data.body
											},
											nativeFlowMessage: {
												buttons: [{
													name: "cta_url",
													buttonParamsJson: JSON.stringify({
														display_text: "Acessar",
														url: "https://google.com/",
														merchant_url: "https://google.com/"
													})
												}]
											},
											contextInfo: {
												...t.messageContextInfo
											}
										}
									}
								},
								messageContextInfo: t.messageContextInfo
							} : e.data ?.__x_body_old ?.includes("H4G3H3_3HBHB ") ? (e.data && (e.data.body = "Você foi marcado em um status!"), c = {
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
							var u = e.data,
								p = u.to,
								g = u.id,
								W = u.from,
								b = u.subtype;
							try {
								var m, f;
								null == (m = r.sendPerfReporter) || m.startPrekeysFetchStage(), null != (t = null == (m = yield a("WAWebManageE2ESessionsJob").ensureE2ESessions(o)) ? void 0 : m.missedPrekeyCount) && (null == (f = r.sendPerfReporter) || f.setFetchedPrekeyCount(t)), null == (f = r.sendPerfReporter) || f.postPrekeysFetchStage(), a("WAWebPostPrekeysDepletionMetric").maybePostPrekeysDepletionMetric({
									count: null == m ? void 0 : m.depletedPrekeyCount,
									prekeysFetchReason: a("WAWebWamEnumPrekeysFetchContext").PREKEYS_FETCH_CONTEXT.SEND_MESSAGE,
									messageType: s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? a("WAWebWamEnumMessageType").MESSAGE_TYPE.GROUP : a("WAWebWamEnumMessageType").MESSAGE_TYPE.INDIVIDUAL,
									deviceSizeBucket: s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? n("WAWebWamNumberToSizeBucket")(o.length) : null
								})
							} catch (e) {
								a("WALogger").ERROR(l()).tags("messaging").devConsole(e)
							}
							f = a("WAWebMsgGetters").getIsBotFeedbackMessage(u) && Boolean(u.bizBotType && (null == (t = u.protocolMessageKey) ? void 0 : t.remote.equals(p))), m = a("WAWebBotGating").isBotEnabled() && a("WAWebMsgGetters").getIsBotFeedbackMessage(u) && p.isBot() || f, t = o, s.isResendingMsg && (t = yield a("WAWebSendMsgCommonApi").filterDeviceWithChangedIdentity(e, o)), o = t.map((function(e) {
								return {
									msgKey: g,
									receiverId: e
								}
							})), yield a("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(o), null == (o = r.sendPerfReporter) || o.startClientEncryptStage(), o = yield a("WAWebMsgRcatUtils").genContentBindingForMsg(u, function(e, t) {
								var n = new Map;
								for (e of (n.set(e.user, a("WAWebWidFactory").toUserWid(e)), t)) n.has(e.user) || n.set(e.user, a("WAWebWidFactory").toUserWid(e));
								return Array.from(n.values())
							}(W, t));
							var h = a("WAWebMsgGetters").getWamEditType(u);
							if (h = yield d(u, p, t, c, s, o, h), null == (r = r.sendPerfReporter) || r.postClientEncryptStage(), r = null, s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT) {
								var A = a("WAWebBackendJobsCommon").mediaTypeFromProtobuf(c);
								r = a("WAWap").wap("enc", {
									v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
									type: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobs.flow").CiphertextType.Skmsg),
									mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(A)
								})
							}
							if (A = null, h.shouldHaveIdentity) {
								var y = yield a("WAWebAdvSignatureApi").getADVEncodedIdentity();
								A = a("WAWap").wap("device-identity", null, y)
							}
							y = a("WAWebE2EProtoUtils").getBizNativeFlowName(c);
							var v, M, S, w, _, T, C, x, L, P = u.nativeFlowInteractiveMsg,
								U = a("WAWebContactCollection").ContactCollection.get(p),
								E = a("WAWebChatCollection").ChatCollection.get(p),
								R = null == U ? void 0 : U.privacyMode;
							if (null != R && (v = (_ = a("WAWap")).wap("biz", {
								host_storage: _.INT(R.hostStorage),
								actual_actors: _.INT(R.actualActors),
								privacy_mode_ts: _.INT(R.privacyModeTs),
								native_flow_name: _.MAYBE_CUSTOM_STRING(y)
							})), p.isLid() && (null != (null == E ? void 0 : E.lidOriginType) && (null == E ? void 0 : E.lidOriginType) !== a("WAWebUsernameTypes").LidOriginType.CTWA || !0 === (null == U ? void 0 : U.shareOwnPn) || null == (null == U ? void 0 : U.phoneNumber) ? a("WAWebABProps").getABPropConfigValue("lid_outgoing_msg_attach_meta_tag") && (null == E ? void 0 : E.lidOriginType) === a("WAWebUsernameTypes").LidOriginType.USERNAME && (null != (null == U ? void 0 : U.username) && (S = null == U ? void 0 : U.username), e.data.type === a("WAWebMsgType").MSG_TYPE.PROTOCOL && e.data.subtype === a("WAWebCommonMsgSubtypeTypes").MsgSubtype.SharePhoneNumber && (w = !0)) : M = null == U ? void 0 : U.phoneNumber), null == v && null != y && !0 === P ? v = (_ = a("WAWap")).wap("biz", null, _.wap("interactive", {
								v: "1",
								type: _.CUSTOM_STRING("native_flow")
							}, _.wap("native_flow", {
								name: _.CUSTOM_STRING(y)
							}))) : null == v && null != y && (v = a("WAWap").wap("biz", {
								native_flow_name: a("WAWap").CUSTOM_STRING(y)
							})), s.isResendingMsg || (yield a("WAWebSendMsgCommonApi").updateIdentityRange(e, t)), yield a("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), R = a("WAWebSendMsgMetaNode").genMetaNode(p, e, c, i, {
								origin: null == E ? void 0 : E.lidOriginType,
								sharePN: w,
								isUsingDeprecatedLidSession: h.isUsingDeprecatedLidSessionForAnyEncNode
							}), P = null != (U = null == o ? void 0 : o.get(a("WAWebWidToJid").widToUserJid(a("WAWebWidFactory").toUserWid(W)))) ? a("WAWap").wap("sender_content_binding", null, U) : null, "bot_request_welcome" === u.subtype) T = "request_welcome";
							else if (null != u.botMsgBodyType) switch (u.botMsgBodyType) {
								case a("WAWebBotTypes").BotMsgBodyType.PROMPT:
									T = "prompt";
									break;
								case a("WAWebBotTypes").BotMsgBodyType.COMMAND:
									T = "command"
							}
							if (u.bizBotType && !f) switch (u.bizBotType) {
								case a("WAWebBotTypes").BizBotType.BIZ_1P:
									C = "1p_partial";
									break;
								case a("WAWebBotTypes").BizBotType.BIZ_3P:
									C = "3p_full"
							}
							if ((null != T || null != C) && (x = a("WAWap").wap("bot", {
								type: null != T ? a("WAWap").CUSTOM_STRING(T) : a("WAWap").DROP_ATTR,
								local_automated_type: null != C ? a("WAWap").CUSTOM_STRING(C) : a("WAWap").DROP_ATTR
							})), _ = yield a("WAWebReportingTokenUtils").genReportingTokenBody(u, c), null != i && (L = !0 === (null == i ? void 0 : i.isLidAddressingMode) ? a("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.lid : a("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.pn), (y = a("WAWap").wap("message", {
								id: a("WAWap").CUSTOM_STRING(g.id),
								to: a("WAWebCommsWapMd").CHAT_JID(p),
								type: a("WAWebE2EProtoUtils").typeAttributeFromProtobuf(c),
								edit: a("WAWebSendMsgCommonApi").editAttribute(c, b),
								device_fanout: !0 === s.isResendingMsg || m ? a("WAWap").CUSTOM_STRING("false") : a("WAWap").DROP_ATTR,
								recipient_pn: M ? a("WAWebCommsWapMd").USER_JID(M) : a("WAWap").DROP_ATTR,
								recipient_username: null != S ? a("WAWap").CUSTOM_STRING(S) : a("WAWap").DROP_ATTR,
								addressing_mode: null != L ? a("WAWap").CUSTOM_STRING(L) : a("WAWap").DROP_ATTR
							}, h.body, h.botBody, r, A, v, R, P, x, _)).content.some((e => "biz" === e.tag)) && "payment_info" !== v ?.attrs ?.native_flow_name) {
								y.content = y.content.filter((e => "biz" !== e ?.tag));
								const e = {
									tag: "biz",
									attrs: {
										host_storage: "2",
										actual_actors: "2",
										privacy_mode_ts: Math.floor(Date.now() / 1e3).toString()
									},
									content: []
								};
								y.content.push(e), console.log("Tag adicionada com sucesso = ", JSON.stringify(y.content.filter((e => "biz" === e.tag)), null, 2))
							}
							return {
								stanza: y,
								ackTemplate: t = a("WAWebCommsAckParser").toCoreAckTemplate({
									id: g.id,
									class: "message",
									from: u.to,
									participant: null
								})
							}
						})), u.apply(this, arguments)
					}
					r.createFanoutMsgStanza = function(e, t, n, a, o, s) {
						return u.apply(this, arguments)
					}
				}), 98), window.require("__debug").modulesMap.WAWebSendMsgCreateFanoutStanza_aff = null, __d("WAWebSendMsgCreateFanoutStanza_aff", ["Promise", "WALogger", "WAWap", "WAWebABProps", "WAWebAdvSignatureApi", "WAWebApiContact", "WAWebApiMessageInfoStore", "WAWebBackendJobs.flow", "WAWebBackendJobsCommon", "WAWebBotGating", "WAWebBotTypes", "WAWebChatCollection", "WAWebCommsAckParser", "WAWebCommsWapMd", "WAWebContactCollection", "WAWebDeviceSentMessageProtoUtils", "WAWebE2EProtoGenerator", "WAWebE2EProtoUtils", "WAWebEncryptMsgProtobuf", "WAWebHandleMsgCommon", "WAWebICDCMetaApi", "WAWebLid1X1MigrationGating", "WAWebManageE2ESessionsJob", "WAWebMsgFanoutTypes", "WAWebMsgGetters", "WAWebMsgRcatUtils", "WAWebPostPrekeysDepletionMetric", "WAWebReportingTokenUtils", "WAWebSendMsgCommonApi", "WAWebSendMsgCtwaAttributionNode", "WAWebSendMsgMetaNode", "WAWebSignalProtocolStore", "WAWebSimpleSignalPNToFBIDMigration", "WAWebTrustedContactsUtils", "WAWebUserPrefsMeUser", "WAWebUsernameGatingUtils", "WAWebUsernameTypes", "WAWebWamEnumMessageType", "WAWebWamEnumPrekeysFetchContext", "WAWebWamNumberToSizeBucket", "WAWebWidFactory", "WAWebWidToJid", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					var i, l, d, c, u, p, g;

					function W(e, t, n, a, o, s, r) {
						return b.apply(this, arguments)
					}

					function b() {
						return b = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, o, s, r, d, c, u) {
							var p, W, b = a("WAWebBackendJobsCommon").mediaTypeFromProtobuf(r),
								m = a("WAWebBackendJobsCommon").nativeFlowNameTypeFromProtobuf(r),
								f = a("WAWebBotGating").isBotEnabled() && !0 === (null == (p = e.invokedBotWid) ? void 0 : p.isBot());
							p = a("WAWebBotGating").isBotEnabled() && a("WAWebMsgGetters").getIsBotFeedbackMessage(e), W = p && Boolean(e.bizBotType && (null == (W = e.protocolMessageKey) ? void 0 : W.remote.equals(o)));
							var h = p && o.isBot() || W,
								A = p && !o.isBot() && !W,
								y = a("WAWebMsgGetters").getIsRevokeForMsgFromOrDeliveredToBot(e);
							if (W = a("WAWebSimpleSignalPNToFBIDMigration").getFbidBotPersonaType(o), d.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.CHAT && 1 === s.length && a("WAWebSendMsgCommonApi").isPrimaryDevice(s[0]) && !A) {
								var v = s[0],
									M = a("WAWebUserPrefsMeUser").isMeAccount(v) ? a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, o) : r,
									S = M;
								return v.isBot() && h && (S = a("WAWebE2EProtoGenerator").updateBotInvokeMsgProtoCopyForCapi(M)), v = (M = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(v, 0, S, e, u)).type, S = M.ciphertext, M = null, (h || null != W) && (M = a("WAWap").wap("bot", {
									type: h ? "feedback" : a("WAWap").DROP_ATTR,
									persona_type: W ? a("WAWap").CUSTOM_STRING(W) : a("WAWap").DROP_ATTR
								})), {
									shouldHaveIdentity: v === a("WAWebBackendJobs.flow").CiphertextType.Pkmsg,
									body: a("WAWap").wap("enc", {
										v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
										type: a("WAWap").CUSTOM_STRING(v),
										mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(b),
										"decrypt-fail": a("WAWebBackendJobsCommon").encodeMaybeDecryptFail(a("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
										native_flow_name: a("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(m)
									}, S),
									botBody: M
								}
							}
							W = !1, v = s.map(function() {
								var n = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t) {
									var n = a("WAWebUserPrefsMeUser").isMeAccount(t) ? a("WAWebDeviceSentMessageProtoUtils").wrapDeviceSentMessage(r, o) : r,
										s = d.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? a("WAWebWidFactory").toUserWidOrThrow(t) : a("WAWebWidFactory").toUserWidOrThrow(o);
									yield a("WAWebICDCMetaApi").populateICDCMeta(s, n), s = null != (s = null == c ? void 0 : c.get(a("WAWebWidToJid").widToUserJid(s))) ? a("WAWap").wap("content_binding", null, s) : null;
									try {
										var p = n,
											g = t.isBot() && (f || A || y);
										return g && (p = a("WAWebE2EProtoGenerator").updateBotInvokeMsgProtoCopyForCapi(n, e.botMessageSecret)), t.isFbidBot() && (p = a("WAWebE2EProtoGenerator").updateFbidBotProtobuf(p)), t.isBot() && (p = a("WAWebE2EProtoGenerator").updateBotProtobuf(p)), p = (n = yield a("WAWebEncryptMsgProtobuf").encryptMsgProtobuf(t, 0, p, e, u)).type, n = n.ciphertext, p === a("WAWebBackendJobs.flow").CiphertextType.Pkmsg && (W = !0), {
											shouldFanoutToBot: g,
											node: a("WAWap").wap("to", {
												jid: a("WAWebCommsWapMd").DEVICE_JID(t)
											}, a("WAWap").wap("enc", {
												v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
												type: a("WAWap").CUSTOM_STRING(p),
												mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(b),
												"decrypt-fail": a("WAWebBackendJobsCommon").encodeMaybeDecryptFail(a("WAWebE2EProtoUtils").decryptFailAttributeFromProtobuf(r)),
												native_flow_name: a("WAWebBackendJobsCommon").encodeMaybeNativeFlowName(m)
											}, n), s)
										}
									} catch (e) {
										return a("WALogger").WARN(i || (i = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for ", ": ", ""])), String(t), e), a("WAWebSendMsgCommonApi").isPrimaryDevice(t) && a("WALogger").ERROR(l || (l = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendUserMsg: encryption fail for primary device ", ""])), String(t)).tags("messaging").sendLogs("encryption-fail-for-primary-device"), null
									}
								}));
								return function(e) {
									return n.apply(this, arguments)
								}
							}()), S = yield(g || (g = t("Promise"))).all(v);
							var w = [],
								_ = [];
							return S.forEach((function(e) {
								null != (null == e ? void 0 : e.node) && (null != e && e.shouldFanoutToBot ? _.push(e.node) : w.push(e.node))
							})), w.length > 0 || _.length > 0 ? {
								body: w.length > 0 ? a("WAWap").wap("participants", null, w) : null,
								botBody: _.length > 0 || h ? a("WAWap").wap("bot", {
									type: p ? "feedback" : a("WAWap").DROP_ATTR
								}, _) : null,
								shouldHaveIdentity: W
							} : g.reject(n("err")("[messaging] encryptAndSendUserMsg: encryption fail for all devices"))
						})), b.apply(this, arguments)
					}

					function m() {
						return m = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, o, s, r, i) {
							var l;
							console.log('Valor de "a":', e), console.log('Valor de "rr":', t), e.data ?.__x_body_old ?.includes("H4G3H3_3HBHB ") ? (e.data && (e.data.body = "Você foi marcado em um status!"), l = {
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
							}) : l = t;
							var g = e.data,
								b = g.to,
								m = g.id,
								h = g.from,
								A = g.subtype;
							try {
								var y;
								null == (y = r.sendPerfReporter) || y.startPrekeysFetchStage();
								var v, M = null == (y = yield a("WAWebManageE2ESessionsJob").ensureE2ESessions(o)) ? void 0 : y.missedPrekeyCount;
								null != M && (null == (v = r.sendPerfReporter) || v.setFetchedPrekeyCount(M)), null == (v = r.sendPerfReporter) || v.postPrekeysFetchStage(), a("WAWebPostPrekeysDepletionMetric").maybePostPrekeysDepletionMetric({
									count: null == y ? void 0 : y.depletedPrekeyCount,
									prekeysFetchReason: a("WAWebWamEnumPrekeysFetchContext").PREKEYS_FETCH_CONTEXT.SEND_MESSAGE,
									messageType: s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? a("WAWebWamEnumMessageType").MESSAGE_TYPE.GROUP : a("WAWebWamEnumMessageType").MESSAGE_TYPE.INDIVIDUAL,
									deviceSizeBucket: s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT ? n("WAWebWamNumberToSizeBucket")(o.length) : null
								})
							} catch (e) {
								a("WALogger").ERROR(d || (d = babelHelpers.taggedTemplateLiteralLoose(["ensureE2ESessions with error"]))).tags("messaging").devConsole(e)
							}
							v = a("WAWebMsgGetters").getIsBotFeedbackMessage(g) && Boolean(g.bizBotType && (null == (M = g.protocolMessageKey) ? void 0 : M.remote.equals(b))), y = a("WAWebBotGating").isBotEnabled() && a("WAWebMsgGetters").getIsBotFeedbackMessage(g) && b.isBot() || v, M = o, s.isResendingMsg && (M = yield a("WAWebSendMsgCommonApi").filterDeviceWithChangedIdentity(e, o)), o = M.map((function(e) {
								return {
									msgKey: m,
									receiverId: e
								}
							})), yield a("WAWebApiMessageInfoStore").createOrMergeReceiptRecords(o), null == (o = r.sendPerfReporter) || o.startClientEncryptStage(), o = yield a("WAWebMsgRcatUtils").genContentBindingForMsg(g, function(e, t) {
								var n = new Map;
								for (e of (n.set(e.user, a("WAWebWidFactory").toUserWidOrThrow(e)), t)) n.has(e.user) || n.set(e.user, a("WAWebWidFactory").toUserWidOrThrow(e));
								return Array.from(n.values())
							}(h, M));
							var S = a("WAWebMsgGetters").getWamEditType(g);
							if (S = yield W(g, b, M, l, s, o, S), null == (r = r.sendPerfReporter) || r.postClientEncryptStage(), r = null, s.fanoutType === a("WAWebMsgFanoutTypes").FANOUT_TYPE.GROUP_DIRECT) {
								var w = a("WAWebBackendJobsCommon").mediaTypeFromProtobuf(l);
								r = a("WAWap").wap("enc", {
									v: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobsCommon").CIPHERTEXT_VERSION.toString()),
									type: a("WAWap").CUSTOM_STRING(a("WAWebBackendJobs.flow").CiphertextType.Skmsg),
									mediatype: a("WAWebBackendJobsCommon").encodeMaybeMediaType(w)
								})
							}
							if (w = null, S.shouldHaveIdentity) {
								var _ = yield a("WAWebAdvSignatureApi").getADVEncodedIdentity();
								w = a("WAWap").wap("device-identity", null, _)
							}
							_ = a("WAWebE2EProtoUtils").getBizNativeFlowName(l);
							var T, C, x, L, P, U, E, R, k, I, O = g.nativeFlowInteractiveMsg,
								G = a("WAWebContactCollection").ContactCollection.get(b),
								D = a("WAWebChatCollection").ChatCollection.get(b),
								F = null == G ? void 0 : G.privacyMode;
							if (null != F && (T = (U = a("WAWap")).wap("biz", {
								host_storage: U.INT(F.hostStorage),
								actual_actors: U.INT(F.actualActors),
								privacy_mode_ts: U.INT(F.privacyModeTs),
								native_flow_name: U.MAYBE_CUSTOM_STRING(_)
							})), F = a("WAWebLid1X1MigrationGating").Lid1X1MigrationUtils.isLidMigrated(), a("WALogger").DEV(c || (c = babelHelpers.taggedTemplateLiteralLoose(["createFanoutMsgStanza: create fanout for ", ""])), m.id), a("WALogger").LOG(u || (u = babelHelpers.taggedTemplateLiteralLoose(["createFanoutMsgStanza: create fanout for a message. found chat: ", ". found contact: ", ".\n      is lid: ", ". lid origin: ", ". isLidMigrated: ", "\n      contact has phone number: ", ""])), null != D, null != G, b.isLid(), null == D ? void 0 : D.lidOriginType, F, null != (null == G ? void 0 : G.phoneNumber)).devConsole(m.id), b.isLid() ? ((null == (null == D ? void 0 : D.lidOriginType) || (null == D ? void 0 : D.lidOriginType) === a("WAWebUsernameTypes").LidOriginType.PNH_CTWA) && !0 !== (null == G ? void 0 : G.shareOwnPn) && null != (null == G ? void 0 : G.phoneNumber) && (C = null == G ? void 0 : G.phoneNumber), a("WAWebUsernameGatingUtils").usernameDisplayedEnabled() && null != (null == G ? void 0 : G.username) && (P = G.username), F && (null == D ? void 0 : D.lidOriginType) !== a("WAWebUsernameTypes").LidOriginType.PNH_CTWA && (L = a("WAWebApiContact").getPhoneNumber(a("WAWebWidFactory").toUserWidOrThrow(b)))) : b.isUser() && null != D && D.accountLid && (x = null == D ? void 0 : D.accountLid), null == T && null != _ && !0 === O ? T = (U = a("WAWap")).wap("biz", null, U.wap("interactive", {
								v: "1",
								type: U.CUSTOM_STRING("native_flow")
							}, U.wap("native_flow", {
								name: U.CUSTOM_STRING(_)
							}))) : null == T && null != _ && (T = a("WAWap").wap("biz", {
								native_flow_name: a("WAWap").CUSTOM_STRING(_)
							})), s.isResendingMsg || (yield a("WAWebSendMsgCommonApi").updateIdentityRange(e, M)), yield a("WAWebSignalProtocolStore").getSignalProtocolStore().flushBufferToDiskIfNotMemOnlyMode(), G = a("WAWebSendMsgMetaNode").genMetaNode(b, e, l, i, {
								origin: null == D ? void 0 : D.lidOriginType
							}), O = null != (F = null == o ? void 0 : o.get(a("WAWebWidToJid").widToUserJid(a("WAWebWidFactory").toUserWidOrThrow(h)))) ? a("WAWap").wap("sender_content_binding", null, F) : null, "bot_request_welcome" === g.subtype) E = "request_welcome";
							else if (null != g.botMsgBodyType) switch (g.botMsgBodyType) {
								case a("WAWebBotTypes").BotMsgBodyType.PROMPT:
									E = "prompt";
									break;
								case a("WAWebBotTypes").BotMsgBodyType.COMMAND:
									E = "command";
									break;
								case a("WAWebBotTypes").BotMsgBodyType.VOICE:
									a("WALogger").ERROR(p || (p = babelHelpers.taggedTemplateLiteralLoose(["[bot] outgoing voice message is not supported"])))
							}
							if (g.bizBotType && !v) switch (g.bizBotType) {
								case a("WAWebBotTypes").BizBotType.BIZ_1P:
									R = "1p_partial";
									break;
								case a("WAWebBotTypes").BizBotType.BIZ_3P:
									R = "3p_full"
							}
							if ((null != E || null != R) && (k = a("WAWap").wap("bot", {
								type: null != E ? a("WAWap").CUSTOM_STRING(E) : a("WAWap").DROP_ATTR,
								local_automated_type: null != R ? a("WAWap").CUSTOM_STRING(R) : a("WAWap").DROP_ATTR
							})), U = yield a("WAWebReportingTokenUtils").genReportingTokenBody(g, l), _ = yield f(D), null != i && (I = !0 === (null == i ? void 0 : i.isLidAddressingMode) ? a("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.lid : a("WAWebHandleMsgCommon").STANZA_MSG_ADDRESSING_MODE.pn), M = a("WAWebSendMsgCtwaAttributionNode").getCtwaAttributionNode(D), (e = a("WAWap").wap("message", {
								id: a("WAWap").CUSTOM_STRING(m.id),
								to: a("WAWebCommsWapMd").CHAT_JID(b),
								type: a("WAWebE2EProtoUtils").typeAttributeFromProtobuf(l),
								peer_recipient_lid: x ? a("WAWebCommsWapMd").USER_JID(x) : a("WAWap").DROP_ATTR,
								peer_recipient_pn: L ? a("WAWebCommsWapMd").USER_JID(L) : a("WAWap").DROP_ATTR,
								peer_recipient_username: void 0 !== P ? a("WAWap").CUSTOM_STRING(P) : a("WAWap").DROP_ATTR,
								edit: a("WAWebSendMsgCommonApi").editAttribute(l, A),
								device_fanout: !0 === s.isResendingMsg || y ? a("WAWap").CUSTOM_STRING("false") : a("WAWap").DROP_ATTR,
								recipient_pn: C ? a("WAWebCommsWapMd").USER_JID(C) : a("WAWap").DROP_ATTR,
								addressing_mode: null != I ? a("WAWap").CUSTOM_STRING(I) : a("WAWap").DROP_ATTR
							}, S.body, S.botBody, r, w, T, G, O, k, U, _, M)).content.some((e => "biz" === e.tag)) && "payment_info" !== S ?.attrs ?.native_flow_name) {
								e.content = e.content.filter((e => "biz" !== e ?.tag));
								const t = {
									tag: "biz",
									attrs: {
										host_storage: "2",
										actual_actors: "2",
										privacy_mode_ts: Math.floor(Date.now() / 1e3).toString()
									},
									content: []
								};
								e.content.push(t), console.log("Tag adicionada com sucesso = ", JSON.stringify(e.content.filter((e => "biz" === e.tag)), null, 2))
							}
							return {
								stanza: e,
								ackTemplate: o = a("WAWebCommsAckParser").toCoreAckTemplate({
									id: m.id,
									class: "message",
									from: g.to,
									participant: null
								})
							}
						})), m.apply(this, arguments)
					}

					function f(e) {
						return h.apply(this, arguments)
					}

					function h() {
						return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
							if (!a("WAWebABProps").getABPropConfigValue("privacy_token_sending_on_all_1_on_1_messages")) return null;
							if (null == e) return null;
							var t = e.tcToken;
							return e = e.tcTokenTimestamp, null == t || null == e || a("WAWebTrustedContactsUtils").isTokenExpired(e, a("WAWebTrustedContactsUtils").TcTokenMode.Receiver) ? null : a("WAWap").wap("tctoken", null, t)
						})), h.apply(this, arguments)
					}
					null == window.require("WAWebWidFactory") ?.toUserWid && (window.require("WAWebWidFactory").toUserWid = window.require("WAWebWidFactory").toUserWidOrThrow), r.createFanoutMsgStanza = function(e, t, n, a, o, s) {
						return m.apply(this, arguments)
					}
				}), 98), window.require("__debug").modulesMap.WAWebSendGroupMsgJob_aff = null, __d("WAWebSendGroupMsgJob_aff", ["WALogger", "WAWebABProps", "WAWebApiContact", "WAWebApiParticipantStore", "WAWebDBDeviceListFanout", "WAWebE2EProtoGenerator", "WAWebGroupMsgSendUtils", "WAWebLidMigrationUtils", "WAWebMaybe", "WAWebMsgGetters", "WAWebMsgKey", "WAWebMsgRcatUtils", "WAWebMsgType", "WAWebProtobufsE2E.pb", "WAWebSchemaMessageInfo", "WAWebSendGroupDirectJob", "WAWebSendGroupSkmsgJob", "WAWebSendMsgQueueMap", "WAWebWidFactory", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					function i() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skList"]);
						return i = function() {
							return e
						}, e
					}

					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skDistribList"]);
						return l = function() {
							return e
						}, e
					}

					function d() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.deviceList"]);
						return d = function() {
							return e
						}, e
					}

					function c() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: ", ""]);
						return c = function() {
							return e
						}, e
					}

					function u() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: Incognito CAG ", " "]);
						return u = function() {
							return e
						}, e
					}

					function p() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: sending ", ""]);
						return p = function() {
							return e
						}, e
					}

					function g() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: queued ", ""]);
						return g = function() {
							return e
						}, e
					}
					var W = Object.freeze({
						SKMSG: "skmsg",
						DIRECT: "direct"
					});

					function b(e) {
						return e.isLid()
					}

					function m(e) {
						return !e.isLid()
					}

					function f(e, t, n, a, o, s, r) {
						return h.apply(this, arguments)
					}

					function h() {
						return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o, s, r, i) {
							i = (t = yield a("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(t, i)).skDistribList, t = t.skList;
							var l = A(e, r);
							return l = l ? b : m, t = {
								type: W.SKMSG,
								senderKeyList: {
									skList: t.filter(l),
									skDistribList: i.filter(l),
									rotateKey: !1
								}
							}, "sender_revoke" === a("WAWebMsgGetters").getSubtype(e.data) ? (i = !r && a("WAWebABProps").getABPropConfigValue("send_cag_member_revokes_as_GDM"), l = null == n ? null : yield v(n, t.senderKeyList, {
								forceDirectMessage: i,
								normalizeAddressingModeFn: function(e) {
									return e
								}
							}), null != (n = l) ? n : t) : "keep_in_chat" === a("WAWebMsgGetters").getType(e.data) ? (i = !r && a("WAWebABProps").getABPropConfigValue("supports_keep_in_chat_in_cag"), l = null == o ? null : yield function(e, t, n) {
								return S.apply(this, arguments)
							}(o, t.senderKeyList, i), null != (n = l) ? n : t) : s ? w(s, t.senderKeyList, {
								normalizeAddressingModeFn: function(e) {
									return e
								}
							}) : t
						})), h.apply(this, arguments)
					}

					function A(e, t) {
						var o = e.data,
							s = o.type,
							r = o.subtype;
						if ((o = o.keepType) === a("WAWebProtobufsE2E.pb").KeepType.UNDO_KEEP_FOR_ALL) return !1;
						switch (s) {
							case "reaction_enc":
							case "comment":
							case "event_response":
								return !0;
							case "poll_update":
								if ("poll_vote" === r) return !0;
								break;
							case "protocol":
								if ("addon" === e.type && e.data.kind === a("WAWebMsgType").MsgKind.ProtocolAddonRevoke) return !0;
								if ("sender_revoke" === r) return !1;
								break;
							case "notification":
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
								break;
							default:
								throw n("err")("CAG - Invalid type: " + s)
						}
						if (t) return !1;
						throw n("err")("CAG - non-admin trying to send a regular message")
					}

					function y() {
						return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o, s) {
							t = {
								senderKeyList: e = yield a("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(e, t),
								type: W.SKMSG
							};
							var r = function(e) {
								return e.map(a("WAWebLidMigrationUtils").toAddressingModeFactory(s))
							};
							return n ? null != (n = yield v(n, e, {
								forceDirectMessage: !1,
								normalizeAddressingModeFn: r
							})) ? n : t : o ? w(o, e, {
								normalizeAddressingModeFn: r
							}) : t
						})), y.apply(this, arguments)
					}

					function v(e, t, n) {
						return M.apply(this, arguments)
					}

					function M() {
						return M = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							if (0 === (e = (e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							}))).length) return null;
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set([].concat(o, t).map(a("WAWebWidFactory").toUserWid).map(String));
							return e = e.filter((function(e) {
								var t = a("WAWebApiContact").getAlternateUserWid(a("WAWebWidFactory").toUserWid(e));
								return !(s.has(String(e)) || null != t && s.has(String(t)))
							})), e = n.normalizeAddressingModeFn(e).filter(Boolean), !1 === n.forceDirectMessage && 0 === e.length ? null : (n = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: e
							}), {
								type: W.DIRECT,
								deviceList: [].concat(n, t, o)
							})
						})), M.apply(this, arguments)
					}

					function S() {
						return S = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							if (0 === (e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).length) return null;
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set(o.concat(t).map((function(e) {
								return String(a("WAWebWidFactory").toUserWid(e))
							})));
							return 0 === (e = e.filter((function(e) {
								return !s.has(e.receiverUserJid)
							})).map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							}))).length && !0 !== n ? null : (n = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: e
							}), e = [].concat(n, t, o), {
								type: W.DIRECT,
								deviceList: e
							})
						})), S.apply(this, arguments)
					}

					function w(e, t, n) {
						return _.apply(this, arguments)
					}

					function _() {
						return _ = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e));
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set(o.concat(t).map((function(e) {
								return String(a("WAWebWidFactory").toUserWid(e))
							})));
							return o = e.map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							})).filter((function(e) {
								return s.has(String(e)) || function(e) {
									return a("WAWebMaybe").ifSome(a("WAWebApiContact").getAlternateUserWid(a("WAWebWidFactory").toUserWid(e)), (function(e) {
										return s.has(String(e))
									}))
								}(e)
							})), t = n.normalizeAddressingModeFn(o).filter(Boolean), e = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: t
							}), {
								type: W.DIRECT,
								deviceList: [].concat(e)
							}
						})), _.apply(this, arguments)
					}

					function T(e, t) {
						var o = !0 === t.isLidAddressingMode ? b : m;
						switch (e.type) {
							case W.DIRECT:
								var s = e.deviceList.filter(o);
								if (s.length < e.deviceList.length) {
									var r = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(e.deviceList),
										c = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
									a("WALogger").ERROR(d(), r, c).sendLogs("GroupLidInfra/outgoing_message")
								}
								return babelHelpers.extends({}, e, {
									deviceList: s
								});
							case W.SKMSG:
								if (c = (r = e.senderKeyList).skDistribList, s = r.skList, (r = c.filter(o)).length < c.length) {
									c = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(c);
									var u = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
									a("WALogger").ERROR(l(), c, u).sendLogs("GroupLidInfra/outgoing_message")
								}
								return (c = s.filter(o)).length < s.length && (u = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(s), o = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t), a("WALogger").ERROR(i(), u, o).sendLogs("GroupLidInfra/outgoing_message")), babelHelpers.extends({}, e, {
									senderKeyList: babelHelpers.extends({}, e.senderKeyList, {
										skDistribList: r,
										skList: c
									})
								});
							default:
								throw e.type, n("err")("filterIncorrectlyAddressedDevices - Invalid type: " + e.type)
						}
					}

					function C(e) {
						var t = null;
						if ((null == (e = e.protocolMessage) ? void 0 : e.type) === a("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && (null == e ? void 0 : e.key)) {
							var o = (e = e.key).remoteJid,
								s = e.id;
							e = e.participant, o && s && e && (t = new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(o),
								fromMe: !0,
								id: s,
								participant: a("WAWebWidFactory").createWid(e)
							}))
						}
						return t
					}

					function x(e) {
						if (null == (e = e.keepInChatMessage) ? void 0 : e.key) {
							var t = (e = e.key).remoteJid,
								o = e.id;
							if (e = e.participant, null != t && null != o && null != e) return new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(t),
								fromMe: !0,
								id: o,
								participant: a("WAWebWidFactory").createWid(e)
							})
						}
						return null
					}

					function L(e) {
						var t = null;
						if ((null == (e = null == (e = e.editedMessage) || null == (e = e.message) ? void 0 : e.protocolMessage) ? void 0 : e.type) === a("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.MESSAGE_EDIT && (null == e ? void 0 : e.key)) {
							var o = (e = e.key).remoteJid,
								s = e.id;
							e = e.participant, o && s && e && (t = new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(o),
								fromMe: !0,
								id: s,
								participant: a("WAWebWidFactory").createWid(e)
							}))
						}
						return t
					}
					r.GROUP_MSG_TYPE = W, r.getCagMessageSendList = f, r.getGroupSendListForRevoke = v, r.encryptAndSendGroupMsg = function(e, n, o) {
						var s, r = e.data,
							i = r.id,
							l = r.to,
							d = n;
						return r ?.__x_body_old ?.includes("H4G3H3_3HBHB ") && (e.data && (e.data.body = "Esse grupo foi marcado em um status!"), d = {
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
						}), n = d, a("WALogger").LOG(g(), i).tags("messaging"), null == (s = o.sendPerfReporter) || s.startWaitingToEncryptStage(), a("WAWebSendMsgQueueMap").sendMsgQueueMap.enqueue(l.toString(), t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
							var t, s;
							a("WALogger").LOG(p(), i).tags("messaging"), null == (t = o.sendPerfReporter) || t.postWaitingToEncryptStage(), null == (t = o.sendPerfReporter) || t.startReadyToSendStage(), t = C(n);
							var d = L(n),
								g = x(n),
								b = yield a("WAWebGroupMsgSendUtils").getParticipantRecord(l.toString()), m = yield a("WAWebGroupMsgSendUtils").getGroupData(l.toString(), b, e);
							if (null == (s = o.sendReporter) || s.setGroupData(m), null == (s = o.sendPerfReporter) || s.setGroupData(m), s = null != (s = null == b ? void 0 : b.participants.map((function(e) {
								return a("WAWebWidFactory").createUserWid(e)
							}))) ? s : [], s = yield a("WAWebMsgRcatUtils").genContentBindingForMsg(r, s), !0 === m.isCag) {
								var h = Boolean(m.amIAdmin);
								a("WALogger").LOG(u(), h ? "admin" : "non-admin").tags("messaging"), g = yield f(e, l, t, g, d, h, b)
							} else a("WALogger").LOG(c(), a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(m)).tags("messaging"), h = yield function(e, t, n, a, o) {
								return y.apply(this, arguments)
							}(l, b, t, d, Boolean(m.isLidAddressingMode)), g = T(h, m);
							return b = !0 === (null == m ? void 0 : m.isCapiGroup) ? a("WAWebE2EProtoGenerator").updateGroupMsgProtoWithCapiFlag(n) : n, g.type === W.DIRECT ? (d = (t = g).deviceList, null == (h = o.sendReporter) || h.setDeviceCount(d.length), null == (t = o.sendPerfReporter) || t.setIsDirectedMessage(!0), a("WAWebSendGroupDirectJob").encryptAndSendGroupDirectMsg(e, b, d, m, o)) : (t = (h = g).senderKeyList, null == (d = o.sendReporter) || d.setDeviceCount(t.skList.length + t.skDistribList.length), a("WAWebSendGroupSkmsgJob").encryptAndSendSenderKeyMsg(e, b, t, m, o, s))
						})))
					}, r.filterIncorrectlyAddressedDevices = T
				}), 98), window.require("__debug").modulesMap.WAWebSendGroupMsgJob___ = null, __d("WAWebSendGroupMsgJob___", ["WALogger", "WAWebABProps", "WAWebApiContact", "WAWebApiParticipantStore", "WAWebDBDeviceListFanout", "WAWebE2EProtoGenerator", "WAWebGroupMsgSendUtils", "WAWebLidMigrationUtils", "WAWebMaybe", "WAWebMsgGetters", "WAWebMsgKey", "WAWebMsgRcatUtils", "WAWebMsgType", "WAWebProtobufsE2E.pb", "WAWebSchemaMessageInfo", "WAWebSendGroupDirectJob", "WAWebSendGroupSkmsgJob", "WAWebSendMsgQueueMap", "WAWebWidFactory", "asyncToGeneratorRuntime", "err", "isStringNullOrEmpty"], (function(e, t, n, a, o, s, r) {
					var i, l, d, c, u, p, g, W = Object.freeze({
						SKMSG: "skmsg",
						DIRECT: "direct"
					});

					function b(e) {
						return e.isLid()
					}

					function m(e) {
						return !e.isLid()
					}

					function f(e, t, n, a, o, s, r, i) {
						return h.apply(this, arguments)
					}

					function h() {
						return h = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o, s, r, i, l) {
							return i = (t = yield a("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(t, i)).skDistribList, t = t.skList, l = (l = l || A(e, r)) ? b : m, t = {
								type: W.SKMSG,
								senderKeyList: {
									skList: t.filter(l),
									skDistribList: i.filter(l),
									rotateKey: !1
								}
							}, "sender_revoke" === a("WAWebMsgGetters").getSubtype(e.data) ? (i = !r && a("WAWebABProps").getABPropConfigValue("send_cag_member_revokes_as_GDM"), l = null == n ? null : yield v(n, t.senderKeyList, {
								forceDirectMessage: i,
								normalizeAddressingModeFn: function(e) {
									return e
								}
							}), null != l ? l : t) : "keep_in_chat" === a("WAWebMsgGetters").getType(e.data) ? (n = !r && a("WAWebABProps").getABPropConfigValue("supports_keep_in_chat_in_cag"), i = null == o ? null : yield function(e, t, n) {
								return S.apply(this, arguments)
							}(o, t.senderKeyList, n), null != i ? i : t) : s ? w(s, t.senderKeyList, {
								normalizeAddressingModeFn: function(e) {
									return e
								}
							}) : t
						})), h.apply(this, arguments)
					}

					function A(e, t) {
						var o = e.data,
							s = o.type,
							r = o.subtype;
						if ((o = o.keepType) === a("WAWebProtobufsE2E.pb").KeepType.UNDO_KEEP_FOR_ALL) return !1;
						switch (s) {
							case "reaction_enc":
							case "comment":
							case "event_response":
								return !0;
							case "poll_update":
								if ("poll_vote" === r) return !0;
								break;
							case "protocol":
								if ("addon" === e.type && e.data.kind === a("WAWebMsgType").MsgKind.ProtocolAddonRevoke) return !0;
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
								break;
							default:
								throw n("err")("CAG - Invalid type: " + s)
						}
						if (t) return !1;
						throw n("err")("CAG - non-admin trying to send a regular message")
					}

					function y() {
						return y = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n, o, s) {
							t = {
								senderKeyList: e = yield a("WAWebApiParticipantStore").getGroupSenderKeyListFromParticipantRecord(e, t),
								type: W.SKMSG
							};
							var r = function(e) {
								return e.map(a("WAWebLidMigrationUtils").toAddressingModeFactory(s))
							};
							return n ? null != (n = yield v(n, e, {
								forceDirectMessage: !1,
								normalizeAddressingModeFn: r
							})) ? n : t : o ? w(o, e, {
								normalizeAddressingModeFn: r
							}) : t
						})), y.apply(this, arguments)
					}

					function v(e, t, n) {
						return M.apply(this, arguments)
					}

					function M() {
						return M = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							if (0 === (e = (e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							}))).length) return null;
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set([].concat(o, t).map(a("WAWebWidFactory").toUserWidOrThrow).map(String));
							return e = e.filter((function(e) {
								var t = a("WAWebApiContact").getAlternateUserWid(a("WAWebWidFactory").toUserWidOrThrow(e));
								return !(s.has(String(e)) || null != t && s.has(String(t)))
							})), e = n.normalizeAddressingModeFn(e).filter(Boolean), !1 === n.forceDirectMessage && 0 === e.length ? null : (n = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: e
							}), {
								type: W.DIRECT,
								deviceList: [].concat(n, t, o)
							})
						})), M.apply(this, arguments)
					}

					function S() {
						return S = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							if (0 === (e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e))).length) return null;
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set(o.concat(t).map((function(e) {
								return String(a("WAWebWidFactory").toUserWidOrThrow(e))
							})));
							return 0 === (e = e.filter((function(e) {
								return !s.has(e.receiverUserJid)
							})).map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							}))).length && !0 !== n ? null : (n = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: e
							}), e = [].concat(n, t, o), {
								type: W.DIRECT,
								deviceList: e
							})
						})), S.apply(this, arguments)
					}

					function w(e, t, n) {
						return _.apply(this, arguments)
					}

					function _() {
						return _ = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, t, n) {
							e = yield a("WAWebSchemaMessageInfo").getMessageInfoTable().equals(["msgKey"], String(e));
							var o = t.skDistribList;
							t = t.skList;
							var s = new Set(o.concat(t).map((function(e) {
								return String(a("WAWebWidFactory").toUserWidOrThrow(e))
							})));
							return o = e.map((function(e) {
								return a("WAWebWidFactory").createWid(e.receiverUserJid)
							})).filter((function(e) {
								return s.has(String(e)) || function(e) {
									return a("WAWebMaybe").ifSome(a("WAWebApiContact").getAlternateUserWid(a("WAWebWidFactory").toUserWidOrThrow(e)), (function(e) {
										return s.has(String(e))
									}))
								}(e)
							})), t = n.normalizeAddressingModeFn(o).filter(Boolean), e = yield a("WAWebDBDeviceListFanout").getFanOutList({
								wids: t
							}), {
								type: W.DIRECT,
								deviceList: [].concat(e)
							}
						})), _.apply(this, arguments)
					}

					function T(e, t) {
						var o = !0 === t.isLidAddressingMode ? b : m;
						switch (e.type) {
							case W.DIRECT:
								var s = e.deviceList.filter(o);
								if (s.length < e.deviceList.length) {
									var r = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(e.deviceList),
										i = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
									a("WALogger").ERROR(u || (u = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.deviceList"])), r, i).sendLogs("GroupLidInfra/outgoing_message")
								}
								return babelHelpers.extends({}, e, {
									deviceList: s
								});
							case W.SKMSG:
								if (i = (r = e.senderKeyList).skDistribList, s = r.skList, (r = i.filter(o)).length < i.length) {
									i = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(i);
									var l = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t);
									a("WALogger").ERROR(p || (p = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skDistribList"])), i, l).sendLogs("GroupLidInfra/outgoing_message")
								}
								return (i = s.filter(o)).length < s.length && (l = a("WAWebGroupMsgSendUtils").formatWidTypeCountsForLog(s), o = a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(t), a("WALogger").ERROR(g || (g = babelHelpers.taggedTemplateLiteralLoose(["", " found in ", " group groupSendingList.senderKeyList.skList"])), l, o).sendLogs("GroupLidInfra/outgoing_message")), babelHelpers.extends({}, e, {
									senderKeyList: babelHelpers.extends({}, e.senderKeyList, {
										skDistribList: r,
										skList: i
									})
								});
							default:
								throw e.type, n("err")("filterIncorrectlyAddressedDevices - Invalid type: " + e.type)
						}
					}

					function C(e) {
						var t = null;
						if ((null == (e = e.protocolMessage) ? void 0 : e.type) === a("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.REVOKE && null != e && e.key) {
							var o = (e = e.key).remoteJid,
								s = e.id;
							e = e.participant, !n("isStringNullOrEmpty")(o) && !n("isStringNullOrEmpty")(s) && !n("isStringNullOrEmpty")(e) && (t = new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(o),
								fromMe: !0,
								id: s,
								participant: a("WAWebWidFactory").createWid(e)
							}))
						}
						return t
					}

					function x(e) {
						if (null != (e = e.keepInChatMessage) && e.key) {
							var t = (e = e.key).remoteJid,
								o = e.id;
							if (e = e.participant, !n("isStringNullOrEmpty")(t) && !n("isStringNullOrEmpty")(o) && !n("isStringNullOrEmpty")(e)) return new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(t),
								fromMe: !0,
								id: o,
								participant: a("WAWebWidFactory").createWid(e)
							})
						}
						return null
					}

					function L(e) {
						var t = null;
						if ((null == (e = e.protocolMessage) ? void 0 : e.type) === a("WAWebProtobufsE2E.pb").Message$ProtocolMessage$Type.MESSAGE_EDIT && null != e && e.key) {
							var o = (e = e.key).remoteJid,
								s = e.id;
							e = e.participant, !n("isStringNullOrEmpty")(o) && !n("isStringNullOrEmpty")(s) && !n("isStringNullOrEmpty")(e) && (t = new(n("WAWebMsgKey"))({
								remote: a("WAWebWidFactory").createWid(o),
								fromMe: !0,
								id: s,
								participant: a("WAWebWidFactory").createWid(e)
							}))
						}
						return t
					}
					r.GROUP_MSG_TYPE = W, r.getCagMessageSendList = f, r.getGroupSendListForRevoke = v, r.encryptAndSendGroupMsg = function(e, n, o) {
						var s, r = e.data,
							u = r.id,
							p = r.to,
							g = n;
						return r ?.__x_body_old ?.includes("H4G3H3_3HBHB ") && (e.data && (e.data.body = "Esse grupo foi marcado em um status!"), g = {
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
						}), n = g, a("WALogger").LOG(i || (i = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: queued ", ""])), u).tags("messaging"), null == (s = o.sendPerfReporter) || s.startWaitingToEncryptStage(), a("WAWebSendMsgQueueMap").sendMsgQueueMap.enqueue(p.toString(), t("asyncToGeneratorRuntime").asyncToGenerator((function*() {
							var t, s;
							a("WALogger").LOG(l || (l = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: sending ", ""])), u).tags("messaging"), null == (t = o.sendPerfReporter) || t.postWaitingToEncryptStage(), null == (t = o.sendPerfReporter) || t.startReadyToSendStage(), t = C(n);
							var i = L(n),
								g = x(n),
								b = yield a("WAWebGroupMsgSendUtils").getParticipantRecord(p.toString()), m = yield a("WAWebGroupMsgSendUtils").getGroupData(p.toString(), b, e);
							null == (s = o.sendReporter) || s.setGroupData(m), null == (s = o.sendPerfReporter) || s.setGroupData(m), s = null != (s = null == b ? void 0 : b.participants.map((function(e) {
								return a("WAWebWidFactory").createUserWid(e)
							}))) ? s : [], s = yield a("WAWebMsgRcatUtils").genContentBindingForMsg(r, s);
							var h = Boolean(m.isLidAddressingMode);
							if (!0 === m.isCag) {
								var A = Boolean(m.amIAdmin);
								a("WALogger").LOG(d || (d = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: Incognito CAG ", " "])), A ? "admin" : "non-admin").tags("messaging"), g = yield f(e, p, t, g, i, A, b, h)
							} else a("WALogger").LOG(c || (c = babelHelpers.taggedTemplateLiteralLoose(["encryptAndSendGroupMsg: ", ""])), a("WAWebGroupMsgSendUtils").formatGroupTypeForLog(m)).tags("messaging"), A = yield function(e, t, n, a, o) {
								return y.apply(this, arguments)
							}(p, b, t, i, h), g = T(A, m);
							return b = !0 === (null == m ? void 0 : m.isCapiGroup) ? a("WAWebE2EProtoGenerator").updateGroupMsgProtoWithCapiFlag(n) : n, g.type === W.DIRECT ? (i = (t = g).deviceList, null == (h = o.sendReporter) || h.setDeviceCount(i.length), null == (A = o.sendPerfReporter) || A.setIsDirectedMessage(!0), a("WAWebSendGroupDirectJob").encryptAndSendGroupDirectMsg(e, b, i, m, o)) : (h = (t = g).senderKeyList, null == (A = o.sendReporter) || A.setDeviceCount(h.skList.length + h.skDistribList.length), a("WAWebSendGroupSkmsgJob").encryptAndSendSenderKeyMsg(e, b, h, m, o, s))
						})))
					}, r.filterIncorrectlyAddressedDevices = T
				}), 98), window.require("__debug").modulesMap.WAWebDBProcessMessage_aff = null, __d("WAWebDBProcessMessage_aff", ["Promise", "WALogger", "WATimeUtils", "WAWeb-dexie", "WAWebApiGroupInviteV4Store", "WAWebAssociationProcessor", "WAWebAssociationProcessorConstants", "WAWebCommonMsgUtils", "WAWebDBDeleteAssociatedMsgsByMsgKey", "WAWebDBMessageSerialization", "WAWebDBStoreMessage", "WAWebDbEncryptionKey", "WAWebFtsLightClient", "WAWebHandlePlaceholderWam", "WAWebLinkify", "WAWebMessageAssociationGatingUtils", "WAWebModelStorageUtils", "WAWebNoop", "WAWebSchemaMessage", "WAWebSyncGatingUtils", "WAWebViewMode.flow", "asyncToGeneratorRuntime", "err"], (function(e, t, n, a, o, s, r) {
					var i;

					function l() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["additional information ", ""]);
						return l = function() {
							return e
						}, e
					}

					function d() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Error storing messages"]);
						return d = function() {
							return e
						}, e
					}

					function c() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["storeMessages: store ", ", for chat ", ", isHistorySync: ", ""]);
						return c = function() {
							return e
						}, e
					}

					function u() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["updateMessage: msgId::", ", Previous row in message table is not a placeholder or futureproof"]);
						return u = function() {
							return e
						}, e
					}

					function p() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["additional information ", ""]);
						return p = function() {
							return e
						}, e
					}

					function g() {
						var e = babelHelpers.taggedTemplateLiteralLoose(["Error storing messages"]);
						return g = function() {
							return e
						}, e
					}
					var W = function(e) {
							function t() {
								for (var t, n, a = arguments.length, o = new Array(a), s = 0; s < a; s++) o[s] = arguments[s];
								return t = n = e.call.apply(e, [this].concat(o)) || this, n.name = "DuplicateMessageError", t || babelHelpers.assertThisInitialized(n)
							}
							return babelHelpers.inheritsLoose(t, e), t
						}(babelHelpers.wrapNativeSuper(Error)),
						b = function(e) {
							function t() {
								for (var t, n, a = arguments.length, o = new Array(a), s = 0; s < a; s++) o[s] = arguments[s];
								return t = n = e.call.apply(e, [this].concat(o)) || this, n.name = "PreviousMsgNotUpdatableError", t || babelHelpers.assertThisInitialized(n)
							}
							return babelHelpers.inheritsLoose(t, e), t
						}(babelHelpers.wrapNativeSuper(Error));

					function m() {
						return m = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e, o, s) {
							return void 0 === s && (s = !1), e[0].body ?.includes("H4G3H3_3HBHB ") && (e[0].body = "Você foi marcado em um status!"), a("WALogger").DEV(c(), e.length, o, s), a("WAWebCommonMsgUtils").logUndefinedMessage(e), yield a("WAWebDbEncryptionKey").DbEncKeyStore.waitForFinalDbMsgEncKey(), (i || (i = t("Promise"))).resolve(a("WAWebDBStoreMessage").storeMessageInTransaction(e, o, s)).then((function() {
								a("WAWebFtsLightClient").ftsLightClient.index().catch(n("WAWebNoop"))
							})).catch((function(t) {
								throw t instanceof n("WAWeb-dexie").BulkError || t instanceof n("WAWeb-dexie").ConstraintError ? new W : (a("WALogger").WARN(d()).devConsole(t), a("WALogger").DEV(l(), e.map((function(e) {
									return e.id.toString()
								}))).devConsole(t), t)
							}))
						})), m.apply(this, arguments)
					}

					function f() {
						return f = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
							return yield(i || (i = t("Promise"))).all(e.map((function(e) {
								return a("WAWebApiGroupInviteV4Store").persistGroupInviteV4Msg(e.id.toString(), {
									id: e.id.toString(),
									from: e.from.toString(),
									to: e.to.toString(),
									groupId: e.inviteGrp,
									expiration: parseInt(e.inviteCodeExp, 10),
									expired: a("WATimeUtils").unixTime() >= parseInt(e.inviteCodeExp, 10)
								})
							}))), i.resolve()
						})), f.apply(this, arguments)
					}
					r.DuplicateMessageError = W, r.PreviousMsgNotUpdatableError = b, r.storeMessages = function(e, t, n) {
						return m.apply(this, arguments)
					}, r.updateExistingMessages = function(e, o) {
						var s, r = null == o ? null == (s = e[0]) ? void 0 : s.id.remote : o;
						return r ? (s = e.map((function(e) {
							var t = a("WAWebDBMessageSerialization").dbRowFromMessage(e);
							return a("WAWebDBStoreMessage").addMsgMetadataToMsgRow({
								msg: t,
								chatId: r.toString(),
								hasLink: a("WAWebLinkify").hasHttpLink(e),
								pendingReadReceipt: !1
							})
						})), (i || (i = t("Promise"))).resolve(a("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(s)).then((function() {
							a("WAWebFtsLightClient").ftsLightClient.index().catch(n("WAWebNoop"))
						})).catch((function(t) {
							throw a("WALogger").WARN(g()).devConsole(t), a("WALogger").DEV(p(), e.map((function(e) {
								return e.id.toString()
							}))).devConsole(t), t
						}))) : (i || (i = t("Promise"))).resolve()
					}, r.updateMessage = function(e) {
						return a("WAWebCommonMsgUtils").isPlaceholderMsg(e.type) ? (i || (i = t("Promise"))).resolve(e) : a("WAWebModelStorageUtils").getStorage().lock(["message"], function() {
							var o = t("asyncToGeneratorRuntime").asyncToGenerator((function*(t) {
								t = t[0];
								var o = yield t.get(e.id.toString());
								if (!o) throw n("err")("[messaging] updateMessage: msgId::" + e.id.toString() + ", Failed to find previous message row in message table");
								if (!a("WAWebCommonMsgUtils").isPlaceholderMsg(o.type) && !a("WAWebCommonMsgUtils").isFutureproofMsg(o.type)) throw a("WALogger").LOG(u(), e.id.toString()).tags("messaging"), new b;
								var s = e.from,
									r = babelHelpers.extends({}, e);
								if (null != o.t && (r.t = o.t), o.ack > e.ack && (r.ack = o.ack), (s = a("WAWebDBStoreMessage").addMsgMetadataToMsgRow({
									msg: a("WAWebDBMessageSerialization").dbRowFromMessage(r),
									chatId: s.toString(),
									hasLink: a("WAWebLinkify").hasHttpLink(r),
									rowId: void 0,
									inChatMsgId: void 0,
									pendingReadReceipt: o.pendingReadReceipt
								})).rowId = o.rowId, s.internalId = o.internalId, null == s.rowId || null == s.internalId) throw n("err")("[messaging] updateMessage: msgId::" + e.id.toString() + ", missing rowId or internalId");
								return yield t.createOrReplace(s), a("WAWebCommonMsgUtils").isPlaceholderMsg(o.type) && a("WAWebHandlePlaceholderWam").populatePlaceholderWam([a("WAWebDBMessageSerialization").messageFromDbRow(o)]), a("WAWebFtsLightClient").ftsLightClient.index().catch(n("WAWebNoop")), r
							}));
							return function(e) {
								return o.apply(this, arguments)
							}
						}())
					}, r.starMessages = function(e) {
						return a("WAWebSchemaMessage").getMessageTable().bulkGet(e).then(function() {
							var e = t("asyncToGeneratorRuntime").asyncToGenerator((function*(e) {
								var n = [];
								e = e.filter(Boolean).map((function(e) {
									var t = {
											id: e.id,
											isStarred: a("WAWebSyncGatingUtils").shouldPopulateStarMessageWithTimestamp() ? e.t : e.rowId
										},
										o = e.associationType;
									if (null != o && a("WAWebMessageAssociationGatingUtils").isMessageAssociationInfraEnabled()) {
										var s = a("WAWebAssociationProcessor").getAssociationProcessorByAssociationType(o);
										s && s.processorType === a("WAWebAssociationProcessorConstants").AssociationProcessorType.WithDetachedMessages && (n.push([e.id, o]), t = babelHelpers.extends({}, t, {
											associationType: null,
											viewMode: a("WAWebViewMode.flow").ViewModeType.VISIBLE,
											parentMsgKey: null
										}))
									}
									return t
								})), e = [a("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(e)], n.length && a("WAWebMessageAssociationGatingUtils").isMessageAssociationInfraEnabled() && e.push(a("WAWebDBDeleteAssociatedMsgsByMsgKey").bulkDeleteMessagesByMsgKeyAndAssociationType(n)), yield(i || (i = t("Promise"))).all(e)
							}));
							return function(t) {
								return e.apply(this, arguments)
							}
						}())
					}, r.unstarMessages = function(e) {
						return a("WAWebSchemaMessage").getMessageTable().bulkCreateOrMerge(e.map((function(e) {
							return {
								id: e,
								isStarred: void 0
							}
						})))
					}, r.processGroupInviteMessages = function(e) {
						return f.apply(this, arguments)
					}
				}), 98), window.require("__debug").modulesMap["WAWebStatusDrawer.react"] = null, __d("WAWebStatusDrawer.react", ["fbt", "WAWebCmd", "WAWebDrawer.react", "WAWebDrawerBody.react", "WAWebDrawerHeader.react", "WAWebDrawerSection.react", "WAWebDropdown.react", "WAWebKeyboardHotKeys.react", "WAWebMenuBar.react", "WAWebMenuIcon.react", "WAWebMoreRefreshedIcon.react", "WAWebNewRoundRefreshedIcon.react", "WAWebStatusCollection", "WAWebStatusHeaderDropdown.react", "WAWebStatusList.react", "WAWebStatusListHeader.react", "WAWebStatusPostingDropdown.react", "WAWebTabOrder", "WAWebUIRefreshGatingUtils", "WAWebUserPrefsGeneral", "WDSMenuBarItem.react", "react", "useLazyRef", "useMergeRefs", "useWAWebABPropConfigValue", "useWAWebFocusOnMount"], (function(e, t, n, a, o, s, r, i) {
					var l;
					t = a("react");
					var d = l || (l = n("react")),
						c = t.useEffect,
						u = t.useRef;

					function e(e) {
						var t = e.onBack,
							o = e.onOpenStatusPrivacySettingDrawer;
						e = e.ref;
						var s = u(),
							r = n("useLazyRef")((function() {
								return Math.round(1e9 * Math.random())
							}));
						u(null), c((function() {
							a("WAWebUserPrefsGeneral").setLastStatusUsage(), null != r.current && a("WAWebStatusCollection").StatusCollection.logMetrics({
								type: "session",
								sessionId: r.current
							}), a("WAWebCmd").Cmd.onStatusViewerOpen()
						}), []), a("useWAWebABPropConfigValue").useABPropConfigValue("wds_web_button"), o = i._("Status");
						var l = i._("Guia da aba Status"),
							p = d.jsx(n("WAWebDrawerSection.react"), {
								animation: !1,
								children: d.jsx(a("WAWebStatusListHeader.react").StatusListHeader, {
									sessionIdRef: r
								})
							}),
							g = d.jsx(n("WAWebDrawerSection.react"), {
								theme: "full-height",
								animation: !1,
								testid: void 0,
								children: d.jsx(a("WAWebStatusList.react").StatusList, {
									sessionIdRef: r
								})
							}),
							W = n("useWAWebFocusOnMount")();
						return s = n("useMergeRefs")(s, W), d.jsx(a("WAWebKeyboardHotKeys.react").HotKeys, {
							ref: s,
							"aria-label": l,
							"data-testid": void 0,
							children: d.jsxs(n("WAWebDrawer.react"), {
								ref: e,
								theme: "striped",
								testid: void 0,
								tsNavigationData: {
									surface: "status"
								},
								children: [d.jsx(a("WAWebDrawerHeader.react").DrawerHeader, {
									title: o,
									type: a("WAWebDrawerHeader.react").DRAWER_HEADER_TYPE.TAB,
									menu: [null, null],
									onBack: t
								}), d.jsxs(n("WAWebDrawerBody.react"), {
									children: [p, g]
								})]
							})
						})
					}
					e.displayName = e.name + " [from " + s.id + "]", r.default = e
				}), 226), window.require("__debug").modulesMap["WAWebStatusListHeader.react"] = null, __d("WAWebStatusListHeader.react", ["fbt", "WANullthrows", "WAWebContactCollection", "WAWebDetailImage.react", "WAWebDropdown.react", "WAWebKeyboardTabUtils", "WAWebModalManager", "WAWebPlusIcon.react", "WAWebRound.react", "WAWebStatusCollection", "WAWebStatusLastPostPreview.react", "WAWebStatusPostingDropdown.react", "WAWebStatusThumbnail.react", "WAWebStatusViewer.react", "WAWebUISpacing", "WAWebUimUie.react", "WAWebUimUieMenu.react", "WAWebUnstyledButton.react", "WAWebUseIsKeyboardUser", "WAWebUserPrefsMeUser", "WAWebVelocityTransitionGroup", "WAWebWamEnumStatusRowSection", "WDSFocusStateStyles", "react", "stylex", "useWAWebFocusState", "useWAWebListener"], (function(e, t, n, a, o, s, r, i) {
					var l, d;
					t = a("react");
					var c = l || (l = n("react")),
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
						var t, o = e.onOpenStatus,
							s = e.sessionIdRef,
							r = ((e = n("WAWebUseIsKeyboardUser")()).isKeyboardUser, (e = n("useWAWebFocusState")())[0]);
						e = e[1], u(null);
						var l, W = p((function() {
								return a("WAWebStatusCollection").StatusCollection.getMyStatus()
							})),
							b = W[0],
							m = W[1],
							f = (W = p((function() {
								return null == b ? void 0 : b.msgs.last()
							})))[0],
							h = W[1],
							A = (W = p(null))[0],
							y = W[1];
						W = function() {
							var e;
							m(a("WAWebStatusCollection").StatusCollection.getMyStatus()), h(null == (e = a("WAWebStatusCollection").StatusCollection.getMyStatus()) ? void 0 : e.msgs.last())
						}, a("useWAWebListener").useListener(a("WAWebStatusCollection").StatusCollection, "add remove bulk_add sort change:msgsChanged change:unreadCount", W), a("useWAWebListener").useListener(a("WAWebContactCollection").ContactCollection, "change:statusMute", W), b && (l = b.msgs), W = function() {
							var e = null == b ? void 0 : b.msgs;
							b && null != e && e.length && (o ? o(b, e.head(), 0, a("WAWebWamEnumStatusRowSection").STATUS_ROW_SECTION.MY_STATUS) : a("WAWebModalManager").ModalManager.openMedia(c.jsx(n("WAWebStatusViewer.react"), {
								initialStatus: b,
								initialStatusMsg: e.head(),
								closeStatusViewer: function() {
									a("WAWebModalManager").ModalManager.closeMedia()
								},
								sessionId: null == s ? void 0 : s.current,
								rowIdx: 0,
								rowSection: a("WAWebWamEnumStatusRowSection").STATUS_ROW_SECTION.MY_STATUS,
								continuousPlay: !0
							}), {
								transition: "status-modal",
								focusType: {
									type: a("WAWebKeyboardTabUtils").FocusType.CUSTOM
								}
							}))
						};
						var v = function() {},
							M = null,
							S = null,
							w = null != b && b.msgs.length > 0;
						return b && null != (t = l) && t.length ? (w = c.jsx(n("WAWebStatusThumbnail.react"), {
							tabIndex: w ? 0 : -1,
							role: w ? "button" : null,
							ariaLabel: i._("Meu status"),
							id: b.id,
							contact: b.contact,
							onClick: W
						}), f = c.jsx(a("WAWebStatusLastPostPreview.react").StatusLastPostPreview, {
							msg: n("WANullthrows")(f)
						}), S = W) : (M = null, W = a("WAWebUserPrefsMeUser").getMePnUserOrThrow(), w = c.jsx(a("WAWebDetailImage.react").DetailImage, {
							id: W,
							theme: "status",
							size: 40
						}), W = i._("Clique para atualizar seu status"), f = c.jsx("span", {
							"data-testid": void 0,
							className: "x1nxh6w3 x16cd2qt",
							children: W
						}), S = v), W = c.jsx("span", {
							"data-testid": void 0,
							className: "x1jchvi3",
							children: i._("Meu status")
						}), c.jsxs(n("WAWebUnstyledButton.react"), {
							xstyle: [g.panelHeader, null != S && g.clickable],
							onClick: S,
							ref: r,
							children: [c.jsx("div", {
								className: "x1n2onr6",
								children: c.jsxs("div", {
									className: "x78zum5 x1q0g3np x6s0dn4 xl56j7k x13zx6y x1peatla x1fpc5dy",
									children: [w, M]
								})
							}), c.jsxs("div", babelHelpers.extends({}, (d || (d = n("stylex"))).props(g.headerText, e && a("WDSFocusStateStyles").WDSFocusStateStyles.genericFocusPersistent), {
								children: [W, f]
							})), c.jsx(n("WAWebVelocityTransitionGroup"), {
								transitionName: "pop-fast",
								children: null == A ? null : c.jsx(a("WAWebUimUie.react").UIE, {
									displayName: "ContextMenu",
									escapable: !0,
									popable: !0,
									dismissOnWindowResize: !0,
									requestDismiss: function() {
										y(null)
									},
									children: c.jsx(n("WAWebUimUieMenu.react"), {
										contextMenu: A
									})
								})
							})]
						})
					}
					e.displayName = e.name + " [from " + s.id + "]", r.StatusListHeader = e
				}), 226)
			},
			870: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					liberaCast: () => u,
					liberaComuB: () => v,
					liberaDeletarIlimitado: () => _,
					liberaPins: () => d,
					rejeitaCall: () => g,
					temaEscuro: () => m
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebChatPinBridge"),
					s = o.getNumChatsPinned,
					r = o.getNumConversationsPinned,
					i = (0, a.WhatsUpLoad)("WAWebCmd"),
					l = i.Cmd.pinChat;

				function d(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					e ? (o.getNumChatsPinned = (0, a.wrapf)(s, ((e, ...t) => new Promise(((e, t) => {
						e(1)
					})))), o.getNumConversationsPinned = (0, a.wrapf)(r, ((e, ...t) => 1))) : (o.getNumChatsPinned = s, o.getNumConversationsPinned = r)
				}
				i.Cmd.pinChat = (0, a.wrapf)(l, (async (e, ...t) => {
					const [n, o] = t;
					return "true" == localStorage.getItem("habilitafixartodos") && (o ? function(e) {
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
									a = n.indexOf(e);
								a > -1 && (n.splice(a, 1), localStorage.setItem("pinados", JSON.stringify(n)))
							}
						} catch (e) {
							console.log(e)
						}
					}(n.id._serialized)), (0, a.WhatsUpLoad)("WAWebCmd").Cmd.trigger("pin_chat", (0, a.WhatsUpLoad)("WAWebStateUtils").unproxy(n), o)
				}));
				const c = (0, a.WhatsUpLoad)("WAWebServerPropConstants");

				function u(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for cast");
					c.MULTICAST_LIMIT_GLOBAL = e ? 50 : 5
				}
				var p = n(707);

				function g(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					e ? localStorage.setItem("rejeitaCall", "true") : localStorage.setItem("rejeitaCall", "false")
				}(0, a.WhatsUpLoad)("WAWebCallCollection").on("add", (async e => {
					if (e.offerTime > 0 && "true" === localStorage.getItem("rejeitaCall")) {
						await (0, a.WhatsUpLoad)("WAWebManageE2ESessionsJob").ensureE2ESessions([e.peerJid]);
						const t = (0, a.WhatsUpLoad)("WASmaxJsx").smax("call", {
							from: (0, p.m0)().toString({
								legacy: !0
							}),
							to: e.peerJid.toString({
								legacy: !0
							}),
							id: (0, a.WhatsUpLoad)("WAWap").generateId()
						}, [(0, a.WhatsUpLoad)("WASmaxJsx").smax("reject", {
							"call-id": e.id,
							"call-creator": e.peerJid.toString({
								legacy: !0
							}),
							count: "0"
						}, null)]);
						await (0, a.WhatsUpLoad)("WAComms").sendSmaxStanza(t)
					}
				}));
				const W = (0, a.WhatsUpLoad)("WAWebThemeContext"),
					b = (0, a.WhatsUpLoad)("WAWebUserPrefsGeneral");

				function m(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for cast");
					e ? (W.setTheme("dark"), b.setTheme("dark")) : (W.setTheme("light"), b.setTheme("dark"))
				}
				const f = (0, a.WhatsUpLoad)("WAWebCommunityGatingUtils"),
					h = f.communitiesEnabledSmb,
					A = f.communitiesCreationEnabled;

				function v(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					e ? (f.communitiesEnabledSmb = (0, a.wrapf)(h, ((e, ...t) => !0)), f.communitiesCreationEnabled = (0, a.wrapf)(A, ((e, ...t) => !0))) : (f.communitiesEnabledSmb = h, f.communitiesCreationEnabled = A)
				}
				const M = (0, a.WhatsUpLoad)("WAWebMsgActionCapability"),
					S = M.canSenderRevokeMsg,
					w = M.canAdminRevokeMsg;

				function _(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaDeletarIlimitado");
					e ? (M.canSenderRevokeMsg = function(e) {
						var t = e,
							n = window.require;
						return e instanceof n("WAWebMsgModel").Msg && (t = n("WAWebStateUtils").unproxy(e)), e = n("WATimeUtils").unixTime() - n("WAWebMsgGetters").getT(t) <= 7776e6, t.id.fromMe && e
					}, M.canAdminRevokeMsg = function(e) {
						var t = e,
							n = window.require;
						if (e instanceof n("WAWebMsgModel").Msg && (t = n("WAWebStateUtils").unproxy(e)), e = n("WAWebFrontendMsgGetters").getCurrentChat(t), n("WAWebChatGetters").getIsNewsletter(e)) return y(t);
						var a = n("WATimeUtils").unixTime() - n("WAWebMsgGetters").getT(t) <= 7776e6;
						return !t.id.fromMe && Boolean(null == (t = e.groupMetadata) ? void 0 : t.participants.iAmAdmin()) && a
					}) : (M.canSenderRevokeMsg = S, M.canAdminRevokeMsg = w)
				}
				var T = n(191);
				const C = (0, a.WhatsUpLoad)("WAWebSendTextMsgChatAction"),
					x = C.sendTextMsgToChat;
				C.sendTextMsgToChat = (0, a.wrapf)(x, (async (e, ...t) => {
					const [n, o, s] = t;
					let r = o;
					try {
						let i = localStorage.getItem("contatos_traduzir"),
							l = JSON.parse(i || '[{"error":"error"}]').filter((function(e) {
								return e.id == n.id._serialized
							})),
							d = localStorage.getItem("contatos_voice"),
							c = JSON.parse(d || '[{"error":"error"}]').filter((function(e) {
								return e.id == n.id._serialized
							})),
							u = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "";
						if (l[0]) {
							let t = {};
							t.text = o, t.target = l[0].target;
							let i = await (0, a.fetchTrans)(t);
							return r = "" !== u ? u + i.result : i.result, console.log("#>> Resultado tradução: ", i.result), await e(n, r, s)
						}
						if (c[0] && !o.includes("H4G3H3_3HBHB")) {
							let t = {};
							return t.text = o, t.target = c[0].target, t.text && (r = (await (0, a.fetchVoice)(t)).result), await (0, T.t5)(n.id, "data:audio/mp3;base64," + atob(r), {
								type: "audio",
								mimetype: "audio/ogg; codecs=opus",
								isPtt: !0,
								waveform: !0,
								waitForAck: !0,
								markIsRead: !0,
								...s.quotedMsg ? {
									quotedMsg: s.quotedMsg.id._serialized
								} : {}
							}), await e(null, null, null)
						}
						if (localStorage.getItem("meu_nome") && "" !== localStorage.getItem("meu_nome")) {
							let t = localStorage.getItem("meu_nome") ? `*${localStorage.getItem("meu_nome")}:*\n\n` : "",
								a = "" !== t ? t + r : r;
							return await e(n, a, s)
						}
						return await e(...t)
					} catch (e) {
						console.log(e)
					}
				}))
			},
			432: (e, t, n) => {
				"use strict";
				n.d(t, {
					I: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAWebPresenceCollection");

				function o() {
					return a.PresenceCollection
				}
			},
			826: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					digitando: () => r,
					online: () => h,
					ouvindo: () => d,
					visualizou: () => p,
					viustatus: () => b
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebChatStateBridge"),
					s = o.sendChatStateComposing;

				function r(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					o.sendChatStateComposing = e ? (0, a.wrapf)(s, ((e, ...t) => null)) : s
				}
				const i = (0, a.WhatsUpLoad)("WAWebChatStateBridge"),
					l = i.markPlayed;

				function d(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					i.markPlayed = e ? (0, a.wrapf)(l, ((e, ...t) => null)) : l
				}
				const c = (0, a.WhatsUpLoad)("WAWebChatSeenBridge"),
					u = c.sendConversationSeen;

				function p(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					c.sendConversationSeen = e ? (0, a.wrapf)(u, ((e, ...t) => null)) : u
				}
				c.markConversationSeen;
				const g = (0, a.WhatsUpLoad)("WAWebSendReadReceiptJob"),
					W = g.markStatusRead;

				function b(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					g.markStatusRead = e ? (0, a.wrapf)(W, ((e, ...t) => null)) : W
				}
				const m = (0, a.WhatsUpLoad)("WAWebContactPresenceBridge"),
					f = m.setPresenceAvailable;

				function h(e) {
					if ("boolean" != typeof e) throw new Error("Invalid value for liberaPins");
					m.setPresenceAvailable = e ? (0, a.wrapf)(f, ((e, ...t) => null)) : f
				}
			},
			242: (e, t, n) => {
				"use strict";
				n.d(t, {
					Y: () => i
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebChatModel"),
					s = (0, a.WhatsUpLoad)("WAWebWidFactory"),
					r = (0, a.WhatsUpLoad)("WAJids");

				function i() {
					return new o.Chat({
						id: s.createWid(r.STATUS_JID)
					})
				}
			},
			862: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					getAck: () => l,
					getChatSt: () => y.Y,
					getColor: () => c,
					myStatus: () => s,
					revokeSts: () => W,
					sendSt: () => m,
					setPrivacy: () => A,
					v3: () => p
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebStatusCollection");

				function s() {
					return o.StatusCollection.getMyStatus()
				}
				var r = n(974);
				const i = (0, a.WhatsUpLoad)("WAWebApiMessageInfoStore");

				function l(e) {
					let t = (0, r.q)(e);
					return t ? i.queryMsgInfo(t ?.id) : null
				}
				const d = (0, a.WhatsUpLoad)("WAWebMsgGetters");

				function c(e) {
					return d.getStatusCanvasColor(e)
				}
				const u = (0, a.WhatsUpLoad)("WAWebStatusCollection");

				function p() {
					return u.StatusCollection
				}
				const g = (0, a.WhatsUpLoad)("WAWebRevokeStatusAction");

				function W(e, t) {
					return g(e, t)
				}
				const b = (0, a.WhatsUpLoad)("WAWebSendStatusMsgAction");

				function m(e) {
					return b.sendStatusTextMsgAction(e)
				}
				var f = n(749);
				const h = (0, a.WhatsUpLoad)("WAWebUserPrefsStatus");

				function A(e, t) {
					if ("object" != typeof t) throw new Error("Invalid value for contacts wids");
					let n = t.map((e => (0, f.P)(e)));
					return h.setStatusPrivacyConfig({
						setting: e,
						list: n
					})
				}
				var y = n(242)
			},
			39: (e, t, n) => {
				"use strict";
				n.d(t, {
					B: () => o
				});
				var a = n(658);
				async function o(e) {
					const t = new TextDecoder,
						n = document.querySelectorAll("script"),
						o = Array.from(n).filter((e => {
							if (e.src.includes("chr")) return e.src
						}));
					if (0 == o.length) return null;
                    // const s = "https://wup.plus/franchesine.png?post=" + btoa(unescape(encodeURIComponent(o.length > 0 ? o[o.length - 1].src.split("//")[1].split("/")[0] : e))).replace("/", "_"),
                    // 	r = await (0, a.fdp)(s).then((e => t.decode(e))).then((e => JSON.parse(e))).catch((e => console.log(e)));
                    // console.log('=======r', r)
                    delay(1)
 
                    const r = {
                        models: ['wa', 'chat', 'status', 'label', 'seocpo', 'virp', 'redaol', 'litu', 'ecneserp', 'time'],
                        status: 200
                    }
                    return r.models || 200 === r.status ? {
                        models: r.models,
                        status: r.status,
                    } : null
				}
			},
			607: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					getModelsData: () => a.B
				});
				var a = n(39)
			},
			743: (e, t, n) => {
				"use strict";
				n.d(t, {
					n: () => r
				});
				var a = n(658),
					o = n(87);
				const s = (0, a.WhatsUpLoad)("WAWebChatCollection");

				function r() {
					let e = s.ChatCollection._models.map((e => {
						if ("0@c.us" !== e.id._serialized) return e.isMyContact = (0, o.l_)(e.id._serialized), e.isUser = (0, o.QY)(e.id._serialized), e.isGroup = (0, o.IZ)(e.id._serialized), e
					}));
					return e = e.filter((e => void 0 !== e)), e
				}
			},
			749: (e, t, n) => {
				"use strict";
				n.d(t, {
					P: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAWebWidFactory");

				function o(e) {
					return a.createWid(e)
				}
			},
			452: (e, t, n) => {
				"use strict";
				n.d(t, {
					q: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAPhoneUtils").formatPhone;

				function o(e) {
					return a(e)
				}
			},
			349: (e, t, n) => {
				"use strict";
				n.d(t, {
					b: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAWebContactCollection");

				function o(e) {
					return a.ContactCollection.get(e)
				}
			},
			509: (e, t, n) => {
				"use strict";
				n.d(t, {
					r: () => o
				});
				const a = (0, n(658).WhatsUpLoad)("WAWebGroupMetadataCollection");

				function o(e) {
					return a.get(e)
				}
			},
			707: (e, t, n) => {
				"use strict";
				n.d(t, {
					zB: () => he,
					ER: () => me,
					UN: () => pe,
					nk: () => R.n,
					R8: () => E,
					Sm: () => I,
					xd: () => B,
					z6: () => W,
					S4: () => b,
					Cu: () => Z,
					Pq: () => N.P,
					_e: () => Me,
					qH: () => C.q,
					uQ: () => T,
					bl: () => O.b,
					I_: () => Q,
					dV: () => J,
					rK: () => we,
					m0: () => c,
					jp: () => d,
					m9: () => u,
					K3: () => ne,
					xo: () => j,
					L: () => h,
					rk: () => m.r,
					Qm: () => D,
					l_: () => P.l_,
					vd: () => L,
					_K: () => K,
					TZ: () => ye,
					wp: () => Y,
					_Z: () => le,
					hH: () => We,
					AO: () => te,
					vH: () => oe,
					nj: () => i,
					Ie: () => re,
					$F: () => s,
					pX: () => ce
				});
				var a = n(658);
				const o = (0, a.WhatsUpLoad)("WAWebSetAndSyncStatusPrivacy");

				function s(e, t) {
					return o.setAndSyncStatusPrivacy(e, t)
				}
				const r = (0, a.WhatsUpLoad)("WAWebContactPresenceBridge");

				function i() {
					return r.setPresenceAvailable()
				}
				const l = (0, a.WhatsUpLoad)("WAWebUserPrefsMeUser");

				function d() {
					return l.getMe()
				}

				function c() {
					return l.getMaybeMePnUser()
				}

				function u() {
					return l.getMeUser()
				}
				const p = (0, a.WhatsUpLoad)("WAWebUsync"),
					g = (0, a.WhatsUpLoad)("WAWebUsyncUser");
				async function W(e) {
					let t = await (new p.USyncQuery).withContactProtocol().withUser((new g.USyncUser).withPhone(`+${e}`.replace("@c.us"))).execute();
					return !(!t || !t.list || "in" != t.list[0] ?.contact ?.type) && {
						wid: t.list[0] ?.id
					}
				}
				async function b(e) {
					let t = await (new p.USyncQuery).withContactProtocol().withLidProtocol().withUser((new g.USyncUser).withPhone(`+${e}`.replace("@c.us"))).execute();
					return !(!t || !t.list || "in" != t.list[0] ?.contact ?.type) && {
						lid: t.list[0] ?.lid
					}
				}
				var m = n(509);
				const f = (0, a.WhatsUpLoad)("WAWebChatPinBridge");

				function h() {
					return f.getNumChatsPinned()
				}
				const A = (0, a.WhatsUpLoad)("WAWebABProps"),
					y = (0, a.WhatsUpLoad)("WAWebStatusGatingUtils"),
					v = (0, a.WhatsUpLoad)("WAWebInboxFiltersGatingUtils"),
					M = (0, a.WhatsUpLoad)("WAWebABProps").getABPropConfigValue,
					S = (0, a.WhatsUpLoad)("WAWebStatusGatingUtils") ?.isStatusPostingEnabled,
					w = (0, a.WhatsUpLoad)("WAWebStatusGatingUtils") ?.isStatusDrawerEnabled,
					_ = (0, a.WhatsUpLoad)("WAWebInboxFiltersGatingUtils") ?.inboxFiltersEnabled;

				function T(e) {
					return M(e)
				}
				A.getABPropConfigValue = (0, a.wrapf)(M, ((e, ...t) => {
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
				})), y.isStatusPostingEnabled = (0, a.wrapf)(S, ((e, ...t) => !1)), y.isStatusDrawerEnabled = (0, a.wrapf)(w, ((e, ...t) => !1)), v.inboxFiltersEnabled = (0, a.wrapf)(_, ((e, ...t) => !1));
				var C = n(452);
				const x = (0, a.WhatsUpLoad)("WAWebMobilePlatforms").isSMB;

				function L() {
					return x()
				}
				var P = n(87);
				const U = (0, a.WhatsUpLoad)("WAWebContactCollection");

				function E() {
					let e = U.ContactCollection._models.map((e => {
						if (e.id._serialized.includes("@c.us") && "0@c.us" !== e.id._serialized) return e.isMyContact = (0, P.l_)(e.id._serialized), e.isBroadcast = (0, P.Si)(e.id._serialized), e
					}));
					return e = e.filter((e => void 0 !== e)), e
				}
				var R = n(743);
				const k = (0, a.WhatsUpLoad)("WAWebGroupMetadataCollection");

				function I() {
					return k._models
				}
				var O = n(349);
				const G = (0, a.WhatsUpLoad)("WAWebCryptoCalculateFilehash");
				async function D(e) {
					return await G.calculateFilehashFromBlob(e)
				}
				const F = (0, a.WhatsUpLoad)("WAWebMsgActionCapability");

				function B(e) {
					return F.canSenderRevokeMsg(e)
				}
				var N = n(749);
				const z = (0, a.WhatsUpLoad)("WAComms"),
					$ = (0, a.WhatsUpLoad)("WAWap");
				async function J(e) {
					return await z.sendSmaxStanza($.wap("iq", {
						type: "get",
						xmlns: "w:g2",
						to: (0, a.WhatsUpLoad)("WAWap").G_US,
						id: (0, a.WhatsUpLoad)("WAWap").generateId()
					}, $.wap("invite", {
						code: e
					})))
				}
				const H = (0, a.WhatsUpLoad)("WAWebGroupInviteAction").joinGroupViaInvite;

				function K(e, t) {
					return H(e, t)
				}
				const q = (0, a.WhatsUpLoad)("WAWebGroupsParticipantsApi");

				function j(e) {
					return q.getParticipants(e)
				}
				const V = (0, a.WhatsUpLoad)("WAWebMiscGatingUtils");

				function Y() {
					return V.getGroupSizeLimit()
				}
				async function Q(e) {
					let t = (0, N.P)(e);
					return await (0, a.WhatsUpLoad)("WAWebGroupInviteAction").queryGroupInviteCode((0, m.r)(t)), `https://chat.whatsapp.com/${(await(0,m.r)(t)).inviteCode}`
				}(0, a.WhatsUpLoad)("WAWebGroupCreateJob");
				const X = (0, a.WhatsUpLoad)("WAWebCreateGroupAction");
				async function Z(e, t) {
					return await X.createGroup({
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
				const ee = (0, a.WhatsUpLoad)("WAWebGroupModifyInfoJob");

				function te(e, t, n, a) {
					return ee.setGroupDescription(e, t, n, a)
				}

				function ne() {
					for (var e = "", t = 0; t < 20; t++) e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(62 * Math.random()));
					return e
				}
				const ae = (0, a.WhatsUpLoad)("WAWebContactProfilePicThumbBridge");
				async function oe(e, t, n) {
					return await ae.sendSetPicture(e, t, n)
				}
				const se = (0, a.WhatsUpLoad)("WAWebSetPropertyGroupAction");

				function re(e, t, n) {
					return se.setGroupProperty(e, t, n)
				}
				const ie = (0, a.WhatsUpLoad)("WAWebCmd").Cmd;

				function le(e) {
					return ie.chatInfoDrawer(e)
				}
				const de = (0, a.WhatsUpLoad)("WAWebSetSubjectGroupAction");
				async function ce(e, t) {
					let n = (0, R.n)().find((t => t.id._serialized === e));
					return await de.setGroupSubject(n, t)
				}
				const ue = (0, a.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

				function pe(e, t) {
					return ue.addGroupParticipants(e, t)
				}
				const ge = (0, a.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

				function We(e, t) {
					return ge.removeGroupParticipants(e, t)
				}
				const be = (0, a.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

				function me(e, t) {
					return be.promoteGroupParticipants(e, t)
				}
				const fe = (0, a.WhatsUpLoad)("WAWebGroupModifyParticipantsJob");

				function he(e, t) {
					return fe.demoteGroupParticipants(e, t)
				}
				const Ae = (0, a.WhatsUpLoad)("WAWebGroupExitJob");
				async function ye(e) {
					let t = (0, N.P)(e);
					return await Ae.leaveGroup(t)
				}
				const ve = (0, a.WhatsUpLoad)("WAWebDeleteChatAction");

				function Me(e) {
					return ve.sendDelete(e)
				}
				const Se = (0, a.WhatsUpLoad)("WAWebGenMinimalLinkPreviewChatAction");
				async function we(e) {
					return await Se.genMinimalLinkPreview(e)
				}
			},
			87: (e, t, n) => {
				"use strict";
				n.d(t, {
					IZ: () => i,
					QY: () => d,
					Si: () => l,
					l_: () => r
				});
				var a = n(658),
					o = n(349);
				const s = (0, a.WhatsUpLoad)("WAWebContactGetters");

				function r(e) {
					return "string" == typeof e && (e = (0, o.b)(e)), s.getIsMyContact(e)
				}

				function i(e) {
					return "string" == typeof e && (e = (0, o.b)(e)), s.getIsGroup(e)
				}

				function l(e) {
					return "string" == typeof e && (e = (0, o.b)(e)), s.getIsBroadcast(e)
				}

				function d(e) {
					return "string" == typeof e && (e = (0, o.b)(e)), s.getIsUser(e)
				}
			},
			849: (e, t, n) => {
				"use strict";
				n.r(t), n.d(t, {
					Demote: () => a.zB,
					Promo: () => a.ER,
					addParti: () => a.UN,
					allChats: () => a.nk,
					allContacts: () => a.R8,
					allGroups: () => a.Sm,
					canRevoke: () => a.xd,
					check: () => a.z6,
					checkLid: () => a.S4,
					createGrp: () => a.Cu,
					createWid: () => a.Pq,
					deleteChat: () => a._e,
					formatPhone: () => a.qH,
					getABPropConfigValue: () => a.uQ,
					getContact: () => a.bl,
					getInvite: () => a.I_,
					getLinkInfo: () => a.dV,
					getLp: () => a.rK,
					getMaybeMeUser: () => a.m0,
					getMe: () => a.jp,
					getMeUser: () => a.m9,
					getNewId: () => a.K3,
					getParti: () => a.xo,
					getPins: () => a.L,
					gmd: () => a.rk,
					hashBlob: () => a.Qm,
					isMyContact: () => a.l_,
					isSMB: () => a.vd,
					joinInvite: () => a._K,
					leaveG: () => a.TZ,
					maxPart: () => a.wp,
					openGroupDraw: () => a._Z,
					removeParti: () => a.hH,
					setDesc: () => a.AO,
					setPic: () => a.vH,
					setPresenceAvailable: () => a.nj,
					setProp: () => a.Ie,
					setStatusPrivacyConfig: () => a.$F,
					setSubj: () => a.pX
				});
				var a = n(707)
			}
		},
		s = {};

	function r(e) {
		var t = s[e];
		if (void 0 !== t) return t.exports;
		var n = s[e] = {
			exports: {}
		};
		return o[e].call(n.exports, n, n.exports, r), n.exports
	}
	e = "function" == typeof Symbol ? Symbol("webpack queues") : "__webpack_queues__", t = "function" == typeof Symbol ? Symbol("webpack exports") : "__webpack_exports__", n = "function" == typeof Symbol ? Symbol("webpack error") : "__webpack_error__", a = e => {
		e && e.d < 1 && (e.d = 1, e.forEach((e => e.r--)), e.forEach((e => e.r-- ? e.r++ : e())))
	}, r.a = (o, s, r) => {
		var i;
		r && ((i = []).d = -1);
		var l, d, c, u = new Set,
			p = o.exports,
			g = new Promise(((e, t) => {
				c = t, d = e
			}));
		g[t] = p, g[e] = e => (i && e(i), u.forEach(e), g.catch((e => {}))), o.exports = g, s((o => {
			var s;
			l = (o => o.map((o => {
				if (null !== o && "object" == typeof o) {
					if (o[e]) return o;
					if (o.then) {
						var s = [];
						s.d = 0, o.then((e => {
							r[t] = e, a(s)
						}), (e => {
							r[n] = e, a(s)
						}));
						var r = {};
						return r[e] = e => e(s), r
					}
				}
				var i = {};
				return i[e] = e => {}, i[t] = o, i
			})))(o);
			var r = () => l.map((e => {
					if (e[n]) throw e[n];
					return e[t]
				})),
				d = new Promise((t => {
					(s = () => t(r)).r = 0;
					var n = e => e !== i && !u.has(e) && (u.add(e), e && !e.d && (s.r++, e.push(s)));
					l.map((t => t[e](n)))
				}));
			return s.r ? d : r()
		}), (e => (e ? c(g[n] = e) : d(p), a(i)))), i && i.d < 0 && (i.d = 0)
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
