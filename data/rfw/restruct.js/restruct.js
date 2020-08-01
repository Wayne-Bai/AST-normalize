(function() {
    // UTF-8 encode/decode routines.
    var decodeUTF8 = function(s) {
        return decodeURIComponent(escape(s));
    };

    var encodeUTF8 = function(s) {
        return unescape(encodeURIComponent(s));
    };

    // Boolean routines.
    var unpackBoolean = function(binary) {
        var x = unpack8(binary);
        return [!!(x & 1), !!(x & 2), !!(x & 4), !!(x & 8),
                !!(x & 16), !!(x & 32), !!(x & 64), !!(x & 128)];
    };

    var packBoolean = function(val, binary) {
        pack8(val[0] | (val[1] << 1) | (val[2] << 2) | (val[3] << 3) |
              (val[4] << 4) | (val[5] << 5) | (val[6] << 6) | (val[7] << 7),
              binary);
    };

    // Nibble routines.
    var unpackNibble = function(binary) {
        var x = unpack8(binary);
        return [x >> 4, x & 0x0f];
    };

    var packNibble = function(val, binary) {
        pack8(val[0] << 4 | val[1], binary);
    };

    // 8-bit routines.
    var sign8 = function(i) {
        return (i + 0x80) % 0x100 - 0x80;
    };

    var unpack8 = function(binary) {
        return binary.array[binary.offset++];
    };

    var pack8 = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
    };

    // 16-bit routines.
    var sign16 = function(i) {
        return (i + 0x8000) % 0x10000 - 0x8000;
    };

    var unpack16l = function(binary) {
        var val = binary.array[binary.offset++];
        val |= binary.array[binary.offset++] << 8;
        val >>>= 0;
        return val;
    };

    var pack16l = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
    };

    var unpack16b = function(binary) {
        var val = binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++];
        val >>>= 0;
        return val;
    };

    var pack16b = function(val, binary) {
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = val & 0xff;
    };

    // 24-bit routines.
    var sign24 = function(i) {
        return (i + 0x800000) % 0x1000000 - 0x800000;
    };

    var unpack24l = function(binary) {
        var val = binary.array[binary.offset++];
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++] << 16;
        val >>>= 0;
        return val;
    };

    var pack24l = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
    };

    var unpack24b = function(binary) {
        var val = binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++];
        val >>>= 0;
        return val;
    };

    var pack24b = function(val, binary) {
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = val & 0xff;
    };

    // 32-bit routines.
    var sign32 = function(i) {
        return (i + 0x80000000) % 0x100000000 - 0x80000000;
    };

    var unpack32l = function(binary) {
        var val = binary.array[binary.offset++];
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 24;
        val >>>= 0;
        return val;
    };

    var pack32l = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 24) & 0xff;
    };

    var unpack32b = function(binary) {
        var val = binary.array[binary.offset++] << 24;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++];
        val >>>= 0;
        return val;
    };

    var pack32b = function(val, binary) {
        binary.array[binary.offset++] = (val >> 24) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = val & 0xff;
    };

    // 40-bit routines.
    var sign40 = function(i) {
        return (i + 0x8000000000) % 0x10000000000 - 0x8000000000;
    };

    var unpack40l = function(binary) {
        var val = binary.array[binary.offset++];
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 24;
        val >>>= 0;
        val += binary.array[binary.offset++] * 0x100000000;
        return val;
    };

    var pack40l = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 24) & 0xff;
        binary.array[binary.offset++] = (val / 0x100000000) & 0xff;
    };

    var unpack40b = function(binary) {
        var head = binary.array[binary.offset++] * 0x100000000;
        var val = binary.array[binary.offset++] << 24;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++];
        val >>>= 0;
        val += head;
        return val;
    };

    var pack40b = function(val, binary) {
        binary.array[binary.offset++] = (val / 0x100000000) & 0xff;
        binary.array[binary.offset++] = (val >> 24) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = val & 0xff;
    };

    // 48-bit routines.
    var sign48 = function(i) {
        return (i + 0x800000000000) % 0x1000000000000 - 0x800000000000;
    };

    var unpack48l = function(binary) {
        var val = binary.array[binary.offset++];
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 24;
        val >>>= 0;
        val += binary.array[binary.offset++] * 0x100000000;
        val += binary.array[binary.offset++] * 0x10000000000;
        return val;
    };

    var pack48l = function(val, binary) {
        binary.array[binary.offset++] = val & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 24) & 0xff;
        binary.array[binary.offset++] = (val / 0x100000000) & 0xff;
        binary.array[binary.offset++] = (val / 0x10000000000) & 0xff;
    };

    var unpack48b = function(binary) {
        var head = binary.array[binary.offset++] * 0x10000000000;
        head += binary.array[binary.offset++] * 0x100000000;
        var val = binary.array[binary.offset++] << 24;
        val |= binary.array[binary.offset++] << 16;
        val |= binary.array[binary.offset++] << 8;
        val |= binary.array[binary.offset++];
        val >>>= 0;
        val += head;
        return val;
    };

    var pack48b = function(val, binary) {
        binary.array[binary.offset++] = (val / 0x10000000000) & 0xff;
        binary.array[binary.offset++] = (val / 0x100000000) & 0xff;
        binary.array[binary.offset++] = (val >> 24) & 0xff;
        binary.array[binary.offset++] = (val >> 16) & 0xff;
        binary.array[binary.offset++] = (val >> 8) & 0xff;
        binary.array[binary.offset++] = val & 0xff;
    };

    // Restruct class.
    var Restruct = function(parent, size, format) {
        if(typeof parent === 'undefined') {
            this.size = 0;
            this.formats = [];
        } else {
            this.size = parent.size + size;
            this.formats = parent.formats.concat(format);
        }
    };

    Restruct.prototype = {
        // Pad NUL bytes.
        pad: function(n) {
            if(typeof n === 'undefined') n = 1;

            return new Restruct(this, n, {
                unpack: function(binary, struct) {
                    binary.offset += n;
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack8(0, binary);
                    }
                }
            });
        },

        // Booleans.
        boolean: function(k, n) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = unpackBoolean(binary);
                    },

                    pack: function(struct, binary) {
                        packBoolean(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, n, {
                unpack: function(binary, struct) {
                    struct[k] = [];
                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpackBoolean(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        packBoolean(struct[k][i], binary);
                    }
                }
            });
        },

        // Nibbles.
        nibble: function(k, n) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = unpackNibble(binary);
                    },

                    pack: function(struct, binary) {
                        packNibble(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, n, {
                unpack: function(binary, struct) {
                    struct[k] = [];
                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpackNibble(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        packNibble(struct[k][i], binary);
                    }
                }
            });
        },

        // 8-bit signed little-endian integer.
        int8ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = sign8(unpack8(binary));
                    },

                    pack: function(struct, binary) {
                        pack8(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 1 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign8(unpack8(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack8(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 8-bit unsigned little-endian integer.
        int8lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack8(binary);
                    },

                    pack: function(struct, binary) {
                        pack8(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 1 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack8(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack8(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 8-bit signed big-endian integer.
        int8bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = sign8(unpack8(binary));
                    },

                    pack: function(struct, binary) {
                        pack8(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 1 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign8(unpack8(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack8(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 8-bit unsigned big-endian integer.
        int8bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 1, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack8(binary);
                    },

                    pack: function(struct, binary) {
                        pack8(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 1 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack8(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack8(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 16-bit signed little-endian integer.
        int16ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 2, {
                    unpack: function(binary, struct) {
                        struct[k] = sign16(unpack16l(binary));
                    },

                    pack: function(struct, binary) {
                        pack16l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 2 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign16(unpack16l(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack16l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 16-bit unsigned little-endian integer.
        int16lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 2, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack16l(binary);
                    },

                    pack: function(struct, binary) {
                        pack16l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 2 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack16l(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack16l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 16-bit signed big-endian integer.
        int16bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 2, {
                    unpack: function(binary, struct) {
                        struct[k] = sign16(unpack16b(binary));
                    },

                    pack: function(struct, binary) {
                        pack16b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 2 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign16(unpack16b(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack16b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 16-bit unsigned big-endian integer.
        int16bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 2, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack16b(binary);
                    },

                    pack: function(struct, binary) {
                        pack16b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 2 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack16b(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack16b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 24-bit signed little-endian integer.
        int24ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 3, {
                    unpack: function(binary, struct) {
                        struct[k] = sign24(unpack24l(binary));
                    },

                    pack: function(struct, binary) {
                        pack24l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 3 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign24(unpack24l(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack24l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 24-bit unsigned little-endian integer.
        int24lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 3, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack24l(binary);
                    },

                    pack: function(struct, binary) {
                        pack24l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 3 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack24l(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack24l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 24-bit signed big-endian integer.
        int24bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 3, {
                    unpack: function(binary, struct) {
                        struct[k] = sign24(unpack24b(binary));
                    },

                    pack: function(struct, binary) {
                        pack24b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 3 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign24(unpack24b(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack24b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 24-bit unsigned big-endian integer.
        int24bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 3, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack24b(binary);
                    },

                    pack: function(struct, binary) {
                        pack24b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 3 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack24b(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack24b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 32-bit signed little-endian integer.
        int32ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 4, {
                    unpack: function(binary, struct) {
                        struct[k] = sign32(unpack32l(binary));
                    },

                    pack: function(struct, binary) {
                        pack32l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 4 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign32(unpack32l(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack32l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 32-bit unsigned little-endian integer.
        int32lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 4, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack32l(binary);
                    },

                    pack: function(struct, binary) {
                        pack32l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 4 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack32l(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack32l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 32-bit signed big-endian integer.
        int32bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 4, {
                    unpack: function(binary, struct) {
                        struct[k] = sign32(unpack32b(binary));
                    },

                    pack: function(struct, binary) {
                        pack32b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 4 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign32(unpack32b(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack32b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 32-bit unsigned big-endian integer.
        int32bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 4, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack32b(binary);
                    },

                    pack: function(struct, binary) {
                        pack32b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 4 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack32b(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack32b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 40-bit signed little-endian integer.
        int40ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 5, {
                    unpack: function(binary, struct) {
                        struct[k] = sign40(unpack40l(binary));
                    },

                    pack: function(struct, binary) {
                        pack40l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 5 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign40(unpack40l(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack40l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 40-bit unsigned little-endian integer.
        int40lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 5, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack40l(binary);
                    },

                    pack: function(struct, binary) {
                        pack40l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 5 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack40l(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack40l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 40-bit signed big-endian integer.
        int40bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 5, {
                    unpack: function(binary, struct) {
                        struct[k] = sign40(unpack40b(binary));
                    },

                    pack: function(struct, binary) {
                        pack40b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 5 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign40(unpack40b(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack40b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 40-bit unsigned big-endian integer.
        int40bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 5, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack40b(binary);
                    },

                    pack: function(struct, binary) {
                        pack40b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 5 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack40b(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack40b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 48-bit signed little-endian integer.
        int48ls: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 6, {
                    unpack: function(binary, struct) {
                        struct[k] = sign48(unpack48l(binary));
                    },

                    pack: function(struct, binary) {
                        pack48l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 6 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = sign48(unpack48l(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack48l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 48-bit unsigned little-endian integer.
        int48lu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 6, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack48l(binary);
                    },

                    pack: function(struct, binary) {
                        pack48l(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 6 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = n - 1; i >= 0; --i) {
                        struct[k][i] = unpack48l(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = n - 1; i >= 0; --i) {
                        pack48l(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 48-bit signed big-endian integer.
        int48bs: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 6, {
                    unpack: function(binary, struct) {
                        struct[k] = sign48(unpack48b(binary));
                    },

                    pack: function(struct, binary) {
                        pack48b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 6 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = sign48(unpack48b(binary));
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack48b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // 48-bit unsigned big-endian integer.
        int48bu: function(k, n, buf) {
            if(typeof n === "undefined") {
                return new Restruct(this, 6, {
                    unpack: function(binary, struct) {
                        struct[k] = unpack48b(binary);
                    },

                    pack: function(struct, binary) {
                        pack48b(struct[k], binary);
                    }
                });
            }

            return new Restruct(this, 6 * n, {
                unpack: function(binary, struct) {
                    if(typeof buf !== "undefined") {
                        struct[k] = buf;
                    } else {
                        struct[k] = [];
                    }

                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = unpack48b(binary);
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        pack48b(struct[k][i] || 0, binary);
                    }
                }
            });
        },

        // UTF-8 string.
        string: function(k, n) {
            return new Restruct(this, n, {
                unpack: function(binary, struct) {
                    var bytes = [];
                    var eos = false;

                    for(var i = 0; i < n; ++i) {
                        var byte = unpack8(binary);
                        if(byte === 0) eos = true;

                        if(!eos) bytes.push(byte);
                    }

                    struct[k] = decodeUTF8(String.fromCharCode.apply(String, bytes));
                },

                pack: function(struct, binary) {
                    var str = encodeUTF8(struct[k]);
                    var len = Math.min(str.length, n);

                    for(var i = 0; i < len; ++i) {
                        pack8(str.charCodeAt(i), binary);
                    }

                    for(; len < n; ++len) {
                        pack8(0, binary);
                    }
                }
            });
        },

        // Another struct.
        struct: function(k, s, n) {
            if(typeof n === "undefined") {
                return new Restruct(this, s.size, {
                    unpack: function(binary, struct) {
                        struct[k] = s.unpack(binary.array, binary.offset);
                        binary.offset += s.size;
                    },

                    pack: function(struct, binary) {
                        s.pack(struct[k], binary.array, binary.offset);
                        binary.offset += s.size;
                    }
                });
            }

            return new Restruct(this, n * s.size, {
                unpack: function(binary, struct) {
                    struct[k] = [];
                    for(var i = 0; i < n; ++i) {
                        struct[k][i] = s.unpack(binary.array, binary.offset);
                        binary.offset += s.size;
                    }
                },

                pack: function(struct, binary) {
                    for(var i = 0; i < n; ++i) {
                        s.pack(struct[k][i], binary.array, binary.offset);
                        binary.offset += s.size;
                    }
                }
            });
        },

        // Unpack an array to a struct.
        unpack: function(array, offset) {
            if(typeof offset === 'undefined') offset = 0;

            var binary = {
                offset: offset,
                array: array
            };

            var struct = {};

            for(var i = 0; i < this.formats.length; ++i) {
                this.formats[i].unpack(binary, struct);
            }

            return struct;
        },

        // Pack an array to a struct.
        pack: function(struct, array, offset) {
            if(typeof offset === 'undefined') offset = 0;
            if(typeof array === 'undefined') array = [];

            var binary = {
                offset: offset,
                array: array
            };

            for(var i = 0; i < this.formats.length; ++i) {
                this.formats[i].pack(struct, binary);
            }

            return binary.array;
        }
    };

    var restruct = new Restruct();

    if(typeof module !== "undefined" && module.exports) {
        module.exports = restruct;
    }
    if(typeof window !== "undefined") {
        window.restruct = restruct;
    }
})();