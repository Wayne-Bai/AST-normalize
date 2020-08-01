module.exports.identifierStart = function(char){
    if( char < 3913 ){
     if( char < 2741 ){
      if( char < 1810 ){
       if( char < 908 ){
        if( char < 710 ){
         if( char < 181 ){
          if( char < 97 ){
           if( char === 95 ){
            return true
           } else {
            if( char < 65 ){
             return char === 36;
            } else {
             return char <= 90;
            }
           }
          } else {
           if( char === 170 ){
            return true
           } else {
            return char >= 97 && char <= 122;
           }
          }
         } else {
          if( char < 216 ){
           if( char < 192 ){
            if( char === 186 ){
             return true
            } else {
             return char === 181;
            }
           } else {
            return char <= 214;
           }
          } else {
           if( char < 248 ){
            return char >= 216 && char <= 246;
           } else {
            return char <= 705;
           }
          }
         }
        } else {
         if( char < 886 ){
          if( char < 750 ){
           if( char === 748 ){
            return true
           } else {
            if( char < 736 ){
             return char >= 710 && char <= 721;
            } else {
             return char <= 740;
            }
           }
          } else {
           if( char < 880 ){
            return char === 750;
           } else {
            return char <= 884;
           }
          }
         } else {
          if( char < 902 ){
           if( char < 890 ){
            return char >= 886 && char <= 887;
           } else {
            return char <= 893;
           }
          } else {
           if( char < 904 ){
            return char === 902;
           } else {
            return char <= 906;
           }
          }
         }
        }
       } else {
        if( char < 1569 ){
         if( char < 1329 ){
          if( char < 1015 ){
           if( char < 931 ){
            if( char < 910 ){
             return char === 908;
            } else {
             return char <= 929;
            }
           } else {
            return char <= 1013;
           }
          } else {
           if( char < 1162 ){
            return char >= 1015 && char <= 1153;
           } else {
            return char <= 1315;
           }
          }
         } else {
          if( char < 1488 ){
           if( char < 1377 ){
            if( char === 1369 ){
             return true
            } else {
             return char >= 1329 && char <= 1366;
            }
           } else {
            return char <= 1415;
           }
          } else {
           if( char < 1520 ){
            return char >= 1488 && char <= 1514;
           } else {
            return char <= 1522;
           }
          }
         }
        } else {
         if( char < 1774 ){
          if( char < 1749 ){
           if( char < 1649 ){
            if( char < 1646 ){
             return char >= 1569 && char <= 1610;
            } else {
             return char <= 1647;
            }
           } else {
            return char <= 1747;
           }
          } else {
           if( char < 1765 ){
            return char === 1749;
           } else {
            return char <= 1766;
           }
          }
         } else {
          if( char < 1791 ){
           if( char < 1786 ){
            return char >= 1774 && char <= 1775;
           } else {
            return char <= 1788;
           }
          } else {
           if( char === 1808 ){
            return true
           } else {
            return char === 1791;
           }
          }
         }
        }
       }
      } else {
       if( char < 2510 ){
        if( char < 2417 ){
         if( char < 2042 ){
          if( char < 1994 ){
           if( char === 1969 ){
            return true
           } else {
            if( char < 1869 ){
             return char >= 1810 && char <= 1839;
            } else {
             return char <= 1957;
            }
           }
          } else {
           if( char < 2036 ){
            return char >= 1994 && char <= 2026;
           } else {
            return char <= 2037;
           }
          }
         } else {
          if( char < 2384 ){
           if( char === 2365 ){
            return true
           } else {
            if( char < 2308 ){
             return char === 2042;
            } else {
             return char <= 2361;
            }
           }
          } else {
           if( char < 2392 ){
            return char === 2384;
           } else {
            return char <= 2401;
           }
          }
         }
        } else {
         if( char < 2474 ){
          if( char < 2447 ){
           if( char < 2437 ){
            if( char < 2427 ){
             return char >= 2417 && char <= 2418;
            } else {
             return char <= 2431;
            }
           } else {
            return char <= 2444;
           }
          } else {
           if( char < 2451 ){
            return char >= 2447 && char <= 2448;
           } else {
            return char <= 2472;
           }
          }
         } else {
          if( char < 2486 ){
           if( char === 2482 ){
            return true
           } else {
            return char >= 2474 && char <= 2480;
           }
          } else {
           if( char === 2493 ){
            return true
           } else {
            return char >= 2486 && char <= 2489;
           }
          }
         }
        }
       } else {
        if( char < 2616 ){
         if( char < 2575 ){
          if( char < 2544 ){
           if( char < 2527 ){
            if( char < 2524 ){
             return char === 2510;
            } else {
             return char <= 2525;
            }
           } else {
            return char <= 2529;
           }
          } else {
           if( char < 2565 ){
            return char >= 2544 && char <= 2545;
           } else {
            return char <= 2570;
           }
          }
         } else {
          if( char < 2610 ){
           if( char < 2602 ){
            if( char < 2579 ){
             return char >= 2575 && char <= 2576;
            } else {
             return char <= 2600;
            }
           } else {
            return char <= 2608;
           }
          } else {
           if( char < 2613 ){
            return char >= 2610 && char <= 2611;
           } else {
            return char <= 2614;
           }
          }
         }
        } else {
         if( char < 2703 ){
          if( char < 2674 ){
           if( char === 2654 ){
            return true
           } else {
            if( char < 2649 ){
             return char >= 2616 && char <= 2617;
            } else {
             return char <= 2652;
            }
           }
          } else {
           if( char < 2693 ){
            return char >= 2674 && char <= 2676;
           } else {
            return char <= 2701;
           }
          }
         } else {
          if( char < 2730 ){
           if( char < 2707 ){
            return char >= 2703 && char <= 2705;
           } else {
            return char <= 2728;
           }
          } else {
           if( char < 2738 ){
            return char >= 2730 && char <= 2736;
           } else {
            return char <= 2739;
           }
          }
         }
        }
       }
      }
     } else {
      if( char < 3261 ){
       if( char < 2972 ){
        if( char < 2877 ){
         if( char < 2831 ){
          if( char < 2784 ){
           if( char === 2768 ){
            return true
           } else {
            if( char === 2749 ){
             return true
            } else {
             return char >= 2741 && char <= 2745;
            }
           }
          } else {
           if( char < 2821 ){
            return char >= 2784 && char <= 2785;
           } else {
            return char <= 2828;
           }
          }
         } else {
          if( char < 2866 ){
           if( char < 2858 ){
            if( char < 2835 ){
             return char >= 2831 && char <= 2832;
            } else {
             return char <= 2856;
            }
           } else {
            return char <= 2864;
           }
          } else {
           if( char < 2869 ){
            return char >= 2866 && char <= 2867;
           } else {
            return char <= 2873;
           }
          }
         }
        } else {
         if( char < 2949 ){
          if( char < 2929 ){
           if( char < 2911 ){
            if( char < 2908 ){
             return char === 2877;
            } else {
             return char <= 2909;
            }
           } else {
            return char <= 2913;
           }
          } else {
           if( char === 2947 ){
            return true
           } else {
            return char === 2929;
           }
          }
         } else {
          if( char < 2962 ){
           if( char < 2958 ){
            return char >= 2949 && char <= 2954;
           } else {
            return char <= 2960;
           }
          } else {
           if( char < 2969 ){
            return char >= 2962 && char <= 2965;
           } else {
            return char <= 2970;
           }
          }
         }
        }
       } else {
        if( char < 3125 ){
         if( char < 3024 ){
          if( char < 2984 ){
           if( char < 2979 ){
            if( char < 2974 ){
             return char === 2972;
            } else {
             return char <= 2975;
            }
           } else {
            return char <= 2980;
           }
          } else {
           if( char < 2990 ){
            return char >= 2984 && char <= 2986;
           } else {
            return char <= 3001;
           }
          }
         } else {
          if( char < 3090 ){
           if( char < 3086 ){
            if( char < 3077 ){
             return char === 3024;
            } else {
             return char <= 3084;
            }
           } else {
            return char <= 3088;
           }
          } else {
           if( char < 3114 ){
            return char >= 3090 && char <= 3112;
           } else {
            return char <= 3123;
           }
          }
         }
        } else {
         if( char < 3214 ){
          if( char < 3168 ){
           if( char < 3160 ){
            if( char === 3133 ){
             return true
            } else {
             return char >= 3125 && char <= 3129;
            }
           } else {
            return char <= 3161;
           }
          } else {
           if( char < 3205 ){
            return char >= 3168 && char <= 3169;
           } else {
            return char <= 3212;
           }
          }
         } else {
          if( char < 3242 ){
           if( char < 3218 ){
            return char >= 3214 && char <= 3216;
           } else {
            return char <= 3240;
           }
          } else {
           if( char < 3253 ){
            return char >= 3242 && char <= 3251;
           } else {
            return char <= 3257;
           }
          }
         }
        }
       }
      } else {
       if( char < 3716 ){
        if( char < 3461 ){
         if( char < 3346 ){
          if( char < 3333 ){
           if( char < 3296 ){
            if( char === 3294 ){
             return true
            } else {
             return char === 3261;
            }
           } else {
            return char <= 3297;
           }
          } else {
           if( char < 3342 ){
            return char >= 3333 && char <= 3340;
           } else {
            return char <= 3344;
           }
          }
         } else {
          if( char < 3424 ){
           if( char === 3389 ){
            return true
           } else {
            if( char < 3370 ){
             return char >= 3346 && char <= 3368;
            } else {
             return char <= 3385;
            }
           }
          } else {
           if( char < 3450 ){
            return char >= 3424 && char <= 3425;
           } else {
            return char <= 3455;
           }
          }
         }
        } else {
         if( char < 3585 ){
          if( char < 3517 ){
           if( char < 3507 ){
            if( char < 3482 ){
             return char >= 3461 && char <= 3478;
            } else {
             return char <= 3505;
            }
           } else {
            return char <= 3515;
           }
          } else {
           if( char < 3520 ){
            return char === 3517;
           } else {
            return char <= 3526;
           }
          }
         } else {
          if( char < 3648 ){
           if( char < 3634 ){
            return char >= 3585 && char <= 3632;
           } else {
            return char <= 3635;
           }
          } else {
           if( char < 3713 ){
            return char >= 3648 && char <= 3654;
           } else {
            return char <= 3714;
           }
          }
         }
        }
       } else {
        if( char < 3754 ){
         if( char < 3737 ){
          if( char < 3725 ){
           if( char === 3722 ){
            return true
           } else {
            if( char < 3719 ){
             return char === 3716;
            } else {
             return char <= 3720;
            }
           }
          } else {
           if( char < 3732 ){
            return char === 3725;
           } else {
            return char <= 3735;
           }
          }
         } else {
          if( char < 3749 ){
           if( char < 3745 ){
            return char >= 3737 && char <= 3743;
           } else {
            return char <= 3747;
           }
          } else {
           if( char === 3751 ){
            return true
           } else {
            return char === 3749;
           }
          }
         }
        } else {
         if( char < 3782 ){
          if( char < 3773 ){
           if( char < 3762 ){
            if( char < 3757 ){
             return char >= 3754 && char <= 3755;
            } else {
             return char <= 3760;
            }
           } else {
            return char <= 3763;
           }
          } else {
           if( char < 3776 ){
            return char === 3773;
           } else {
            return char <= 3780;
           }
          }
         } else {
          if( char < 3840 ){
           if( char < 3804 ){
            return char === 3782;
           } else {
            return char <= 3805;
           }
          } else {
           if( char < 3904 ){
            return char === 3840;
           } else {
            return char <= 3911;
           }
          }
         }
        }
       }
      }
     }
    } else {
     if( char < 8064 ){
      if( char < 5792 ){
       if( char < 4688 ){
        if( char < 4238 ){
         if( char < 4186 ){
          if( char < 4159 ){
           if( char < 4096 ){
            if( char < 3976 ){
             return char >= 3913 && char <= 3948;
            } else {
             return char <= 3979;
            }
           } else {
            return char <= 4138;
           }
          } else {
           if( char < 4176 ){
            return char === 4159;
           } else {
            return char <= 4181;
           }
          }
         } else {
          if( char < 4206 ){
           if( char < 4197 ){
            if( char === 4193 ){
             return true
            } else {
             return char >= 4186 && char <= 4189;
            }
           } else {
            return char <= 4198;
           }
          } else {
           if( char < 4213 ){
            return char >= 4206 && char <= 4208;
           } else {
            return char <= 4225;
           }
          }
         }
        } else {
         if( char < 4447 ){
          if( char < 4348 ){
           if( char < 4304 ){
            if( char < 4256 ){
             return char === 4238;
            } else {
             return char <= 4293;
            }
           } else {
            return char <= 4346;
           }
          } else {
           if( char < 4352 ){
            return char === 4348;
           } else {
            return char <= 4441;
           }
          }
         } else {
          if( char < 4608 ){
           if( char < 4520 ){
            return char >= 4447 && char <= 4514;
           } else {
            return char <= 4601;
           }
          } else {
           if( char < 4682 ){
            return char >= 4608 && char <= 4680;
           } else {
            return char <= 4685;
           }
          }
         }
        }
       } else {
        if( char < 4808 ){
         if( char < 4752 ){
          if( char < 4704 ){
           if( char < 4698 ){
            if( char === 4696 ){
             return true
            } else {
             return char >= 4688 && char <= 4694;
            }
           } else {
            return char <= 4701;
           }
          } else {
           if( char < 4746 ){
            return char >= 4704 && char <= 4744;
           } else {
            return char <= 4749;
           }
          }
         } else {
          if( char < 4800 ){
           if( char < 4792 ){
            if( char < 4786 ){
             return char >= 4752 && char <= 4784;
            } else {
             return char <= 4789;
            }
           } else {
            return char <= 4798;
           }
          } else {
           if( char < 4802 ){
            return char === 4800;
           } else {
            return char <= 4805;
           }
          }
         }
        } else {
         if( char < 5024 ){
          if( char < 4888 ){
           if( char < 4882 ){
            if( char < 4824 ){
             return char >= 4808 && char <= 4822;
            } else {
             return char <= 4880;
            }
           } else {
            return char <= 4885;
           }
          } else {
           if( char < 4992 ){
            return char >= 4888 && char <= 4954;
           } else {
            return char <= 5007;
           }
          }
         } else {
          if( char < 5743 ){
           if( char < 5121 ){
            return char >= 5024 && char <= 5108;
           } else {
            return char <= 5740;
           }
          } else {
           if( char < 5761 ){
            return char >= 5743 && char <= 5750;
           } else {
            return char <= 5786;
           }
          }
         }
        }
       }
      } else {
       if( char < 6656 ){
        if( char < 6108 ){
         if( char < 5952 ){
          if( char < 5902 ){
           if( char < 5888 ){
            if( char < 5870 ){
             return char >= 5792 && char <= 5866;
            } else {
             return char <= 5872;
            }
           } else {
            return char <= 5900;
           }
          } else {
           if( char < 5920 ){
            return char >= 5902 && char <= 5905;
           } else {
            return char <= 5937;
           }
          }
         } else {
          if( char < 6016 ){
           if( char < 5998 ){
            if( char < 5984 ){
             return char >= 5952 && char <= 5969;
            } else {
             return char <= 5996;
            }
           } else {
            return char <= 6000;
           }
          } else {
           if( char === 6103 ){
            return true
           } else {
            return char >= 6016 && char <= 6067;
           }
          }
         }
        } else {
         if( char < 6480 ){
          if( char < 6314 ){
           if( char < 6272 ){
            if( char < 6176 ){
             return char === 6108;
            } else {
             return char <= 6263;
            }
           } else {
            return char <= 6312;
           }
          } else {
           if( char < 6400 ){
            return char === 6314;
           } else {
            return char <= 6428;
           }
          }
         } else {
          if( char < 6528 ){
           if( char < 6512 ){
            return char >= 6480 && char <= 6509;
           } else {
            return char <= 6516;
           }
          } else {
           if( char < 6593 ){
            return char >= 6528 && char <= 6569;
           } else {
            return char <= 6599;
           }
          }
         }
        }
       } else {
        if( char < 7680 ){
         if( char < 7168 ){
          if( char < 7043 ){
           if( char < 6981 ){
            if( char < 6917 ){
             return char >= 6656 && char <= 6678;
            } else {
             return char <= 6963;
            }
           } else {
            return char <= 6987;
           }
          } else {
           if( char < 7086 ){
            return char >= 7043 && char <= 7072;
           } else {
            return char <= 7087;
           }
          }
         } else {
          if( char < 7258 ){
           if( char < 7245 ){
            return char >= 7168 && char <= 7203;
           } else {
            return char <= 7247;
           }
          } else {
           if( char < 7424 ){
            return char >= 7258 && char <= 7293;
           } else {
            return char <= 7615;
           }
          }
         }
        } else {
         if( char < 8025 ){
          if( char < 8008 ){
           if( char < 7968 ){
            if( char < 7960 ){
             return char >= 7680 && char <= 7957;
            } else {
             return char <= 7965;
            }
           } else {
            return char <= 8005;
           }
          } else {
           if( char < 8016 ){
            return char >= 8008 && char <= 8013;
           } else {
            return char <= 8023;
           }
          }
         } else {
          if( char < 8029 ){
           if( char === 8027 ){
            return true
           } else {
            return char === 8025;
           }
          } else {
           if( char < 8031 ){
            return char === 8029;
           } else {
            return char <= 8061;
           }
          }
         }
        }
       }
      }
     } else {
      if( char < 11696 ){
       if( char < 8486 ){
        if( char < 8305 ){
         if( char < 8144 ){
          if( char < 8130 ){
           if( char === 8126 ){
            return true
           } else {
            if( char < 8118 ){
             return char >= 8064 && char <= 8116;
            } else {
             return char <= 8124;
            }
           }
          } else {
           if( char < 8134 ){
            return char >= 8130 && char <= 8132;
           } else {
            return char <= 8140;
           }
          }
         } else {
          if( char < 8178 ){
           if( char < 8160 ){
            if( char < 8150 ){
             return char >= 8144 && char <= 8147;
            } else {
             return char <= 8155;
            }
           } else {
            return char <= 8172;
           }
          } else {
           if( char < 8182 ){
            return char >= 8178 && char <= 8180;
           } else {
            return char <= 8187;
           }
          }
         }
        } else {
         if( char < 8458 ){
          if( char < 8450 ){
           if( char < 8336 ){
            if( char === 8319 ){
             return true
            } else {
             return char === 8305;
            }
           } else {
            return char <= 8340;
           }
          } else {
           if( char === 8455 ){
            return true
           } else {
            return char === 8450;
           }
          }
         } else {
          if( char < 8473 ){
           if( char === 8469 ){
            return true
           } else {
            return char >= 8458 && char <= 8467;
           }
          } else {
           if( char === 8484 ){
            return true
           } else {
            return char >= 8473 && char <= 8477;
           }
          }
         }
        }
       } else {
        if( char < 11360 ){
         if( char < 8517 ){
          if( char < 8495 ){
           if( char < 8490 ){
            if( char === 8488 ){
             return true
            } else {
             return char === 8486;
            }
           } else {
            return char <= 8493;
           }
          } else {
           if( char < 8508 ){
            return char >= 8495 && char <= 8505;
           } else {
            return char <= 8511;
           }
          }
         } else {
          if( char < 11264 ){
           if( char < 8544 ){
            if( char === 8526 ){
             return true
            } else {
             return char >= 8517 && char <= 8521;
            }
           } else {
            return char <= 8584;
           }
          } else {
           if( char < 11312 ){
            return char >= 11264 && char <= 11310;
           } else {
            return char <= 11358;
           }
          }
         }
        } else {
         if( char < 11631 ){
          if( char < 11520 ){
           if( char < 11392 ){
            if( char < 11377 ){
             return char >= 11360 && char <= 11375;
            } else {
             return char <= 11389;
            }
           } else {
            return char <= 11492;
           }
          } else {
           if( char < 11568 ){
            return char >= 11520 && char <= 11557;
           } else {
            return char <= 11621;
           }
          }
         } else {
          if( char < 11680 ){
           if( char < 11648 ){
            return char === 11631;
           } else {
            return char <= 11670;
           }
          } else {
           if( char < 11688 ){
            return char >= 11680 && char <= 11686;
           } else {
            return char <= 11694;
           }
          }
         }
        }
       }
      } else {
       if( char < 13312 ){
        if( char < 12344 ){
         if( char < 11736 ){
          if( char < 11720 ){
           if( char < 11712 ){
            if( char < 11704 ){
             return char >= 11696 && char <= 11702;
            } else {
             return char <= 11710;
            }
           } else {
            return char <= 11718;
           }
          } else {
           if( char < 11728 ){
            return char >= 11720 && char <= 11726;
           } else {
            return char <= 11734;
           }
          }
         } else {
          if( char < 12321 ){
           if( char < 12293 ){
            if( char === 11823 ){
             return true
            } else {
             return char >= 11736 && char <= 11742;
            }
           } else {
            return char <= 12295;
           }
          } else {
           if( char < 12337 ){
            return char >= 12321 && char <= 12329;
           } else {
            return char <= 12341;
           }
          }
         }
        } else {
         if( char < 12549 ){
          if( char < 12449 ){
           if( char < 12445 ){
            if( char < 12353 ){
             return char >= 12344 && char <= 12348;
            } else {
             return char <= 12438;
            }
           } else {
            return char <= 12447;
           }
          } else {
           if( char < 12540 ){
            return char >= 12449 && char <= 12538;
           } else {
            return char <= 12543;
           }
          }
         } else {
          if( char < 12704 ){
           if( char < 12593 ){
            return char >= 12549 && char <= 12589;
           } else {
            return char <= 12686;
           }
          } else {
           if( char < 12784 ){
            return char >= 12704 && char <= 12727;
           } else {
            return char <= 12799;
           }
          }
         }
        }
       } else {
        if( char < 42775 ){
         if( char < 42508 ){
          if( char < 40899 ){
           if( char === 19968 ){
            return true
           } else {
            if( char === 19893 ){
             return true
            } else {
             return char === 13312;
            }
           }
          } else {
           if( char < 40960 ){
            return char === 40899;
           } else {
            return char <= 41391;
           }
          }
         } else {
          if( char < 42594 ){
           if( char < 42560 ){
            return char === 42508;
           } else {
            return char <= 42591;
           }
          } else {
           if( char < 42623 ){
            return char >= 42594 && char <= 42605;
           } else {
            return char <= 42647;
           }
          }
         }
        } else {
         if( char < 65313 ){
          if( char < 64256 ){
           if( char < 42891 ){
            if( char < 42786 ){
             return char >= 42775 && char <= 42783;
            } else {
             return char <= 42888;
            }
           } else {
            return char <= 42892;
           }
          } else {
           if( char < 64275 ){
            return char >= 64256 && char <= 64262;
           } else {
            return char <= 64279;
           }
          }
         } else {
          if( char < 65392 ){
           if( char < 65345 ){
            return char >= 65313 && char <= 65338;
           } else {
            return char <= 65370;
           }
          } else {
           if( char < 65438 ){
            return char === 65392;
           } else {
            return char <= 65439;
           }
          }
         }
        }
       }
      }
     }
    }
}
module.exports.identifier = function(char){
    if( char < 3784 ){
     if( char < 2817 ){
      if( char < 2364 ){
       if( char < 1155 ){
        if( char < 736 ){
         if( char < 181 ){
          if( char < 95 ){
           if( char < 65 ){
            if( char < 48 ){
             return char === 36;
            } else {
             return char <= 57;
            }
           } else {
            if( char === 95 ){
             return true
            } else {
             return char >= 65 && char <= 90;
            }
           }
          } else {
           if( char === 170 ){
            return true
           } else {
            if( char < 97 ){
             return char === 95;
            } else {
             return char <= 122;
            }
           }
          }
         } else {
          if( char < 216 ){
           if( char < 192 ){
            if( char === 186 ){
             return true
            } else {
             return char === 181;
            }
           } else {
            return char <= 214;
           }
          } else {
           if( char < 710 ){
            if( char < 248 ){
             return char >= 216 && char <= 246;
            } else {
             return char <= 705;
            }
           } else {
            return char <= 721;
           }
          }
         }
        } else {
         if( char < 902 ){
          if( char < 768 ){
           if( char === 750 ){
            return true
           } else {
            if( char === 748 ){
             return true
            } else {
             return char >= 736 && char <= 740;
            }
           }
          } else {
           if( char < 890 ){
            if( char < 886 ){
             return char >= 768 && char <= 884;
            } else {
             return char <= 887;
            }
           } else {
            return char <= 893;
           }
          }
         } else {
          if( char < 910 ){
           if( char === 908 ){
            return true
           } else {
            if( char < 904 ){
             return char === 902;
            } else {
             return char <= 906;
            }
           }
          } else {
           if( char < 1015 ){
            if( char < 931 ){
             return char >= 910 && char <= 929;
            } else {
             return char <= 1013;
            }
           } else {
            return char <= 1153;
           }
          }
         }
        }
       } else {
        if( char < 1569 ){
         if( char < 1473 ){
          if( char < 1377 ){
           if( char < 1329 ){
            if( char < 1162 ){
             return char >= 1155 && char <= 1159;
            } else {
             return char <= 1315;
            }
           } else {
            if( char === 1369 ){
             return true
            } else {
             return char >= 1329 && char <= 1366;
            }
           }
          } else {
           if( char === 1471 ){
            return true
           } else {
            if( char < 1425 ){
             return char >= 1377 && char <= 1415;
            } else {
             return char <= 1469;
            }
           }
          }
         } else {
          if( char < 1488 ){
           if( char === 1479 ){
            return true
           } else {
            if( char < 1476 ){
             return char >= 1473 && char <= 1474;
            } else {
             return char <= 1477;
            }
           }
          } else {
           if( char < 1552 ){
            if( char < 1520 ){
             return char >= 1488 && char <= 1514;
            } else {
             return char <= 1522;
            }
           } else {
            return char <= 1562;
           }
          }
         }
        } else {
         if( char < 1791 ){
          if( char < 1749 ){
           if( char < 1646 ){
            if( char < 1632 ){
             return char >= 1569 && char <= 1630;
            } else {
             return char <= 1641;
            }
           } else {
            return char <= 1747;
           }
          } else {
           if( char < 1770 ){
            if( char < 1759 ){
             return char >= 1749 && char <= 1756;
            } else {
             return char <= 1768;
            }
           } else {
            return char <= 1788;
           }
          }
         } else {
          if( char < 1984 ){
           if( char < 1869 ){
            if( char < 1808 ){
             return char === 1791;
            } else {
             return char <= 1866;
            }
           } else {
            return char <= 1969;
           }
          } else {
           if( char < 2305 ){
            if( char === 2042 ){
             return true
            } else {
             return char >= 1984 && char <= 2037;
            }
           } else {
            return char <= 2361;
           }
          }
         }
        }
       }
      } else {
       if( char < 2610 ){
        if( char < 2492 ){
         if( char < 2437 ){
          if( char < 2417 ){
           if( char < 2392 ){
            if( char < 2384 ){
             return char >= 2364 && char <= 2381;
            } else {
             return char <= 2388;
            }
           } else {
            if( char < 2406 ){
             return char >= 2392 && char <= 2403;
            } else {
             return char <= 2415;
            }
           }
          } else {
           if( char < 2433 ){
            if( char < 2427 ){
             return char >= 2417 && char <= 2418;
            } else {
             return char <= 2431;
            }
           } else {
            return char <= 2435;
           }
          }
         } else {
          if( char < 2474 ){
           if( char < 2451 ){
            if( char < 2447 ){
             return char >= 2437 && char <= 2444;
            } else {
             return char <= 2448;
            }
           } else {
            return char <= 2472;
           }
          } else {
           if( char < 2486 ){
            if( char === 2482 ){
             return true
            } else {
             return char >= 2474 && char <= 2480;
            }
           } else {
            return char <= 2489;
           }
          }
         }
        } else {
         if( char < 2534 ){
          if( char < 2519 ){
           if( char < 2507 ){
            if( char < 2503 ){
             return char >= 2492 && char <= 2500;
            } else {
             return char <= 2504;
            }
           } else {
            return char <= 2510;
           }
          } else {
           if( char < 2527 ){
            if( char < 2524 ){
             return char === 2519;
            } else {
             return char <= 2525;
            }
           } else {
            return char <= 2531;
           }
          }
         } else {
          if( char < 2575 ){
           if( char < 2565 ){
            if( char < 2561 ){
             return char >= 2534 && char <= 2545;
            } else {
             return char <= 2563;
            }
           } else {
            return char <= 2570;
           }
          } else {
           if( char < 2602 ){
            if( char < 2579 ){
             return char >= 2575 && char <= 2576;
            } else {
             return char <= 2600;
            }
           } else {
            return char <= 2608;
           }
          }
         }
        }
       } else {
        if( char < 2693 ){
         if( char < 2635 ){
          if( char < 2620 ){
           if( char < 2616 ){
            if( char < 2613 ){
             return char >= 2610 && char <= 2611;
            } else {
             return char <= 2614;
            }
           } else {
            return char <= 2617;
           }
          } else {
           if( char < 2631 ){
            if( char < 2622 ){
             return char === 2620;
            } else {
             return char <= 2626;
            }
           } else {
            return char <= 2632;
           }
          }
         } else {
          if( char < 2654 ){
           if( char < 2649 ){
            if( char === 2641 ){
             return true
            } else {
             return char >= 2635 && char <= 2637;
            }
           } else {
            return char <= 2652;
           }
          } else {
           if( char < 2689 ){
            if( char < 2662 ){
             return char === 2654;
            } else {
             return char <= 2677;
            }
           } else {
            return char <= 2691;
           }
          }
         }
        } else {
         if( char < 2748 ){
          if( char < 2730 ){
           if( char < 2707 ){
            if( char < 2703 ){
             return char >= 2693 && char <= 2701;
            } else {
             return char <= 2705;
            }
           } else {
            return char <= 2728;
           }
          } else {
           if( char < 2741 ){
            if( char < 2738 ){
             return char >= 2730 && char <= 2736;
            } else {
             return char <= 2739;
            }
           } else {
            return char <= 2745;
           }
          }
         } else {
          if( char < 2768 ){
           if( char < 2763 ){
            if( char < 2759 ){
             return char >= 2748 && char <= 2757;
            } else {
             return char <= 2761;
            }
           } else {
            return char <= 2765;
           }
          } else {
           if( char < 2790 ){
            if( char < 2784 ){
             return char === 2768;
            } else {
             return char <= 2787;
            }
           } else {
            return char <= 2799;
           }
          }
         }
        }
       }
      }
     } else {
      if( char < 3253 ){
       if( char < 3006 ){
        if( char < 2918 ){
         if( char < 2876 ){
          if( char < 2858 ){
           if( char < 2831 ){
            if( char < 2821 ){
             return char >= 2817 && char <= 2819;
            } else {
             return char <= 2828;
            }
           } else {
            if( char < 2835 ){
             return char >= 2831 && char <= 2832;
            } else {
             return char <= 2856;
            }
           }
          } else {
           if( char < 2869 ){
            if( char < 2866 ){
             return char >= 2858 && char <= 2864;
            } else {
             return char <= 2867;
            }
           } else {
            return char <= 2873;
           }
          }
         } else {
          if( char < 2902 ){
           if( char < 2891 ){
            if( char < 2887 ){
             return char >= 2876 && char <= 2884;
            } else {
             return char <= 2888;
            }
           } else {
            return char <= 2893;
           }
          } else {
           if( char < 2911 ){
            if( char < 2908 ){
             return char >= 2902 && char <= 2903;
            } else {
             return char <= 2909;
            }
           } else {
            return char <= 2915;
           }
          }
         }
        } else {
         if( char < 2969 ){
          if( char < 2949 ){
           if( char < 2946 ){
            if( char === 2929 ){
             return true
            } else {
             return char >= 2918 && char <= 2927;
            }
           } else {
            return char <= 2947;
           }
          } else {
           if( char < 2962 ){
            if( char < 2958 ){
             return char >= 2949 && char <= 2954;
            } else {
             return char <= 2960;
            }
           } else {
            return char <= 2965;
           }
          }
         } else {
          if( char < 2979 ){
           if( char < 2974 ){
            if( char === 2972 ){
             return true
            } else {
             return char >= 2969 && char <= 2970;
            }
           } else {
            return char <= 2975;
           }
          } else {
           if( char < 2990 ){
            if( char < 2984 ){
             return char >= 2979 && char <= 2980;
            } else {
             return char <= 2986;
            }
           } else {
            return char <= 3001;
           }
          }
         }
        }
       } else {
        if( char < 3133 ){
         if( char < 3073 ){
          if( char < 3024 ){
           if( char < 3018 ){
            if( char < 3014 ){
             return char >= 3006 && char <= 3010;
            } else {
             return char <= 3016;
            }
           } else {
            return char <= 3021;
           }
          } else {
           if( char < 3046 ){
            if( char === 3031 ){
             return true
            } else {
             return char === 3024;
            }
           } else {
            return char <= 3055;
           }
          }
         } else {
          if( char < 3090 ){
           if( char < 3086 ){
            if( char < 3077 ){
             return char >= 3073 && char <= 3075;
            } else {
             return char <= 3084;
            }
           } else {
            return char <= 3088;
           }
          } else {
           if( char < 3125 ){
            if( char < 3114 ){
             return char >= 3090 && char <= 3112;
            } else {
             return char <= 3123;
            }
           } else {
            return char <= 3129;
           }
          }
         }
        } else {
         if( char < 3174 ){
          if( char < 3157 ){
           if( char < 3146 ){
            if( char < 3142 ){
             return char >= 3133 && char <= 3140;
            } else {
             return char <= 3144;
            }
           } else {
            return char <= 3149;
           }
          } else {
           if( char < 3168 ){
            if( char < 3160 ){
             return char >= 3157 && char <= 3158;
            } else {
             return char <= 3161;
            }
           } else {
            return char <= 3171;
           }
          }
         } else {
          if( char < 3214 ){
           if( char < 3205 ){
            if( char < 3202 ){
             return char >= 3174 && char <= 3183;
            } else {
             return char <= 3203;
            }
           } else {
            return char <= 3212;
           }
          } else {
           if( char < 3242 ){
            if( char < 3218 ){
             return char >= 3214 && char <= 3216;
            } else {
             return char <= 3240;
            }
           } else {
            return char <= 3251;
           }
          }
         }
        }
       }
      } else {
       if( char < 3520 ){
        if( char < 3389 ){
         if( char < 3302 ){
          if( char < 3285 ){
           if( char < 3270 ){
            if( char < 3260 ){
             return char >= 3253 && char <= 3257;
            } else {
             return char <= 3268;
            }
           } else {
            if( char < 3274 ){
             return char >= 3270 && char <= 3272;
            } else {
             return char <= 3277;
            }
           }
          } else {
           if( char < 3296 ){
            if( char === 3294 ){
             return true
            } else {
             return char >= 3285 && char <= 3286;
            }
           } else {
            return char <= 3299;
           }
          }
         } else {
          if( char < 3342 ){
           if( char < 3333 ){
            if( char < 3330 ){
             return char >= 3302 && char <= 3311;
            } else {
             return char <= 3331;
            }
           } else {
            return char <= 3340;
           }
          } else {
           if( char < 3370 ){
            if( char < 3346 ){
             return char >= 3342 && char <= 3344;
            } else {
             return char <= 3368;
            }
           } else {
            return char <= 3385;
           }
          }
         }
        } else {
         if( char < 3450 ){
          if( char < 3415 ){
           if( char < 3402 ){
            if( char < 3398 ){
             return char >= 3389 && char <= 3396;
            } else {
             return char <= 3400;
            }
           } else {
            return char <= 3405;
           }
          } else {
           if( char < 3430 ){
            if( char < 3424 ){
             return char === 3415;
            } else {
             return char <= 3427;
            }
           } else {
            return char <= 3439;
           }
          }
         } else {
          if( char < 3482 ){
           if( char < 3461 ){
            if( char < 3458 ){
             return char >= 3450 && char <= 3455;
            } else {
             return char <= 3459;
            }
           } else {
            return char <= 3478;
           }
          } else {
           if( char === 3517 ){
            return true
           } else {
            if( char < 3507 ){
             return char >= 3482 && char <= 3505;
            } else {
             return char <= 3515;
            }
           }
          }
         }
        }
       } else {
        if( char < 3722 ){
         if( char < 3585 ){
          if( char < 3542 ){
           if( char < 3535 ){
            if( char === 3530 ){
             return true
            } else {
             return char >= 3520 && char <= 3526;
            }
           } else {
            return char <= 3540;
           }
          } else {
           if( char < 3570 ){
            if( char < 3544 ){
             return char === 3542;
            } else {
             return char <= 3551;
            }
           } else {
            return char <= 3571;
           }
          }
         } else {
          if( char < 3713 ){
           if( char < 3664 ){
            if( char < 3648 ){
             return char >= 3585 && char <= 3642;
            } else {
             return char <= 3662;
            }
           } else {
            return char <= 3673;
           }
          } else {
           if( char < 3719 ){
            if( char === 3716 ){
             return true
            } else {
             return char >= 3713 && char <= 3714;
            }
           } else {
            return char <= 3720;
           }
          }
         }
        } else {
         if( char < 3751 ){
          if( char < 3737 ){
           if( char < 3732 ){
            if( char === 3725 ){
             return true
            } else {
             return char === 3722;
            }
           } else {
            return char <= 3735;
           }
          } else {
           if( char === 3749 ){
            return true
           } else {
            if( char < 3745 ){
             return char >= 3737 && char <= 3743;
            } else {
             return char <= 3747;
            }
           }
          }
         } else {
          if( char < 3771 ){
           if( char < 3757 ){
            if( char < 3754 ){
             return char === 3751;
            } else {
             return char <= 3755;
            }
           } else {
            return char <= 3769;
           }
          } else {
           if( char === 3782 ){
            return true
           } else {
            if( char < 3776 ){
             return char >= 3771 && char <= 3773;
            } else {
             return char <= 3780;
            }
           }
          }
         }
        }
       }
      }
     }
    } else {
     if( char < 8178 ){
      if( char < 5920 ){
       if( char < 4682 ){
        if( char < 3984 ){
         if( char < 3895 ){
          if( char < 3864 ){
           if( char < 3804 ){
            if( char < 3792 ){
             return char >= 3784 && char <= 3789;
            } else {
             return char <= 3801;
            }
           } else {
            if( char === 3840 ){
             return true
            } else {
             return char >= 3804 && char <= 3805;
            }
           }
          } else {
           if( char === 3893 ){
            return true
           } else {
            if( char < 3872 ){
             return char >= 3864 && char <= 3865;
            } else {
             return char <= 3881;
            }
           }
          }
         } else {
          if( char < 3913 ){
           if( char < 3902 ){
            if( char === 3897 ){
             return true
            } else {
             return char === 3895;
            }
           } else {
            return char <= 3911;
           }
          } else {
           if( char < 3974 ){
            if( char < 3953 ){
             return char >= 3913 && char <= 3948;
            } else {
             return char <= 3972;
            }
           } else {
            return char <= 3979;
           }
          }
         }
        } else {
         if( char < 4304 ){
          if( char < 4096 ){
           if( char === 4038 ){
            return true
           } else {
            if( char < 3993 ){
             return char >= 3984 && char <= 3991;
            } else {
             return char <= 4028;
            }
           }
          } else {
           if( char < 4256 ){
            if( char < 4176 ){
             return char >= 4096 && char <= 4169;
            } else {
             return char <= 4249;
            }
           } else {
            return char <= 4293;
           }
          }
         } else {
          if( char < 4447 ){
           if( char < 4352 ){
            if( char === 4348 ){
             return true
            } else {
             return char >= 4304 && char <= 4346;
            }
           } else {
            return char <= 4441;
           }
          } else {
           if( char < 4608 ){
            if( char < 4520 ){
             return char >= 4447 && char <= 4514;
            } else {
             return char <= 4601;
            }
           } else {
            return char <= 4680;
           }
          }
         }
        }
       } else {
        if( char < 4882 ){
         if( char < 4786 ){
          if( char < 4704 ){
           if( char < 4696 ){
            if( char < 4688 ){
             return char >= 4682 && char <= 4685;
            } else {
             return char <= 4694;
            }
           } else {
            if( char < 4698 ){
             return char === 4696;
            } else {
             return char <= 4701;
            }
           }
          } else {
           if( char < 4752 ){
            if( char < 4746 ){
             return char >= 4704 && char <= 4744;
            } else {
             return char <= 4749;
            }
           } else {
            return char <= 4784;
           }
          }
         } else {
          if( char < 4802 ){
           if( char === 4800 ){
            return true
           } else {
            if( char < 4792 ){
             return char >= 4786 && char <= 4789;
            } else {
             return char <= 4798;
            }
           }
          } else {
           if( char < 4824 ){
            if( char < 4808 ){
             return char >= 4802 && char <= 4805;
            } else {
             return char <= 4822;
            }
           } else {
            return char <= 4880;
           }
          }
         }
        } else {
         if( char < 5743 ){
          if( char < 4992 ){
           if( char === 4959 ){
            return true
           } else {
            if( char < 4888 ){
             return char >= 4882 && char <= 4885;
            } else {
             return char <= 4954;
            }
           }
          } else {
           if( char < 5121 ){
            if( char < 5024 ){
             return char >= 4992 && char <= 5007;
            } else {
             return char <= 5108;
            }
           } else {
            return char <= 5740;
           }
          }
         } else {
          if( char < 5870 ){
           if( char < 5792 ){
            if( char < 5761 ){
             return char >= 5743 && char <= 5750;
            } else {
             return char <= 5786;
            }
           } else {
            return char <= 5866;
           }
          } else {
           if( char < 5902 ){
            if( char < 5888 ){
             return char >= 5870 && char <= 5872;
            } else {
             return char <= 5900;
            }
           } else {
            return char <= 5908;
           }
          }
         }
        }
       }
      } else {
       if( char < 7019 ){
        if( char < 6272 ){
         if( char < 6103 ){
          if( char < 6002 ){
           if( char < 5984 ){
            if( char < 5952 ){
             return char >= 5920 && char <= 5940;
            } else {
             return char <= 5971;
            }
           } else {
            if( char < 5998 ){
             return char >= 5984 && char <= 5996;
            } else {
             return char <= 6000;
            }
           }
          } else {
           if( char < 6070 ){
            if( char < 6016 ){
             return char >= 6002 && char <= 6003;
            } else {
             return char <= 6067;
            }
           } else {
            return char <= 6099;
           }
          }
         } else {
          if( char < 6155 ){
           if( char < 6112 ){
            if( char < 6108 ){
             return char === 6103;
            } else {
             return char <= 6109;
            }
           } else {
            return char <= 6121;
           }
          } else {
           if( char < 6176 ){
            if( char < 6160 ){
             return char >= 6155 && char <= 6157;
            } else {
             return char <= 6169;
            }
           } else {
            return char <= 6263;
           }
          }
         }
        } else {
         if( char < 6528 ){
          if( char < 6448 ){
           if( char < 6432 ){
            if( char < 6400 ){
             return char >= 6272 && char <= 6314;
            } else {
             return char <= 6428;
            }
           } else {
            return char <= 6443;
           }
          } else {
           if( char < 6512 ){
            if( char < 6470 ){
             return char >= 6448 && char <= 6459;
            } else {
             return char <= 6509;
            }
           } else {
            return char <= 6516;
           }
          }
         } else {
          if( char < 6656 ){
           if( char < 6608 ){
            if( char < 6576 ){
             return char >= 6528 && char <= 6569;
            } else {
             return char <= 6601;
            }
           } else {
            return char <= 6617;
           }
          } else {
           if( char < 6992 ){
            if( char < 6912 ){
             return char >= 6656 && char <= 6683;
            } else {
             return char <= 6987;
            }
           } else {
            return char <= 7001;
           }
          }
         }
        }
       } else {
        if( char < 8025 ){
         if( char < 7424 ){
          if( char < 7168 ){
           if( char < 7086 ){
            if( char < 7040 ){
             return char >= 7019 && char <= 7027;
            } else {
             return char <= 7082;
            }
           } else {
            return char <= 7097;
           }
          } else {
           if( char < 7245 ){
            if( char < 7232 ){
             return char >= 7168 && char <= 7223;
            } else {
             return char <= 7241;
            }
           } else {
            return char <= 7293;
           }
          }
         } else {
          if( char < 7968 ){
           if( char < 7960 ){
            if( char < 7678 ){
             return char >= 7424 && char <= 7654;
            } else {
             return char <= 7957;
            }
           } else {
            return char <= 7965;
           }
          } else {
           if( char < 8016 ){
            if( char < 8008 ){
             return char >= 7968 && char <= 8005;
            } else {
             return char <= 8013;
            }
           } else {
            return char <= 8023;
           }
          }
         }
        } else {
         if( char < 8126 ){
          if( char < 8031 ){
           if( char === 8029 ){
            return true
           } else {
            if( char === 8027 ){
             return true
            } else {
             return char === 8025;
            }
           }
          } else {
           if( char < 8118 ){
            if( char < 8064 ){
             return char >= 8031 && char <= 8061;
            } else {
             return char <= 8116;
            }
           } else {
            return char <= 8124;
           }
          }
         } else {
          if( char < 8144 ){
           if( char < 8134 ){
            if( char < 8130 ){
             return char === 8126;
            } else {
             return char <= 8132;
            }
           } else {
            return char <= 8140;
           }
          } else {
           if( char < 8160 ){
            if( char < 8150 ){
             return char >= 8144 && char <= 8147;
            } else {
             return char <= 8155;
            }
           } else {
            return char <= 8172;
           }
          }
         }
        }
       }
      }
     } else {
      if( char < 12445 ){
       if( char < 11312 ){
        if( char < 8469 ){
         if( char < 8400 ){
          if( char < 8305 ){
           if( char < 8255 ){
            if( char < 8182 ){
             return char >= 8178 && char <= 8180;
            } else {
             return char <= 8187;
            }
           } else {
            if( char === 8276 ){
             return true
            } else {
             return char >= 8255 && char <= 8256;
            }
           }
          } else {
           if( char < 8336 ){
            if( char === 8319 ){
             return true
            } else {
             return char === 8305;
            }
           } else {
            return char <= 8340;
           }
          }
         } else {
          if( char < 8450 ){
           if( char < 8421 ){
            if( char === 8417 ){
             return true
            } else {
             return char >= 8400 && char <= 8412;
            }
           } else {
            return char <= 8432;
           }
          } else {
           if( char < 8458 ){
            if( char === 8455 ){
             return true
            } else {
             return char === 8450;
            }
           } else {
            return char <= 8467;
           }
          }
         }
        } else {
         if( char < 8495 ){
          if( char < 8486 ){
           if( char === 8484 ){
            return true
           } else {
            if( char < 8473 ){
             return char === 8469;
            } else {
             return char <= 8477;
            }
           }
          } else {
           if( char < 8490 ){
            if( char === 8488 ){
             return true
            } else {
             return char === 8486;
            }
           } else {
            return char <= 8493;
           }
          }
         } else {
          if( char < 8526 ){
           if( char < 8517 ){
            if( char < 8508 ){
             return char >= 8495 && char <= 8505;
            } else {
             return char <= 8511;
            }
           } else {
            return char <= 8521;
           }
          } else {
           if( char < 11264 ){
            if( char < 8544 ){
             return char === 8526;
            } else {
             return char <= 8584;
            }
           } else {
            return char <= 11310;
           }
          }
         }
        }
       } else {
        if( char < 11712 ){
         if( char < 11631 ){
          if( char < 11392 ){
           if( char < 11377 ){
            if( char < 11360 ){
             return char >= 11312 && char <= 11358;
            } else {
             return char <= 11375;
            }
           } else {
            return char <= 11389;
           }
          } else {
           if( char < 11568 ){
            if( char < 11520 ){
             return char >= 11392 && char <= 11492;
            } else {
             return char <= 11557;
            }
           } else {
            return char <= 11621;
           }
          }
         } else {
          if( char < 11688 ){
           if( char < 11680 ){
            if( char < 11648 ){
             return char === 11631;
            } else {
             return char <= 11670;
            }
           } else {
            return char <= 11686;
           }
          } else {
           if( char < 11704 ){
            if( char < 11696 ){
             return char >= 11688 && char <= 11694;
            } else {
             return char <= 11702;
            }
           } else {
            return char <= 11710;
           }
          }
         }
        } else {
         if( char < 12293 ){
          if( char < 11736 ){
           if( char < 11728 ){
            if( char < 11720 ){
             return char >= 11712 && char <= 11718;
            } else {
             return char <= 11726;
            }
           } else {
            return char <= 11734;
           }
          } else {
           if( char === 11823 ){
            return true
           } else {
            if( char < 11744 ){
             return char >= 11736 && char <= 11742;
            } else {
             return char <= 11775;
            }
           }
          }
         } else {
          if( char < 12344 ){
           if( char < 12337 ){
            if( char < 12321 ){
             return char >= 12293 && char <= 12295;
            } else {
             return char <= 12335;
            }
           } else {
            return char <= 12341;
           }
          } else {
           if( char < 12441 ){
            if( char < 12353 ){
             return char >= 12344 && char <= 12348;
            } else {
             return char <= 12438;
            }
           } else {
            return char <= 12442;
           }
          }
         }
        }
       }
      } else {
       if( char < 43043 ){
        if( char < 42528 ){
         if( char < 13312 ){
          if( char < 12593 ){
           if( char < 12540 ){
            if( char < 12449 ){
             return char >= 12445 && char <= 12447;
            } else {
             return char <= 12538;
            }
           } else {
            if( char < 12549 ){
             return char >= 12540 && char <= 12543;
            } else {
             return char <= 12589;
            }
           }
          } else {
           if( char < 12784 ){
            if( char < 12704 ){
             return char >= 12593 && char <= 12686;
            } else {
             return char <= 12727;
            }
           } else {
            return char <= 12799;
           }
          }
         } else {
          if( char < 40899 ){
           if( char === 19968 ){
            return true
           } else {
            if( char === 19893 ){
             return true
            } else {
             return char === 13312;
            }
           }
          } else {
           if( char === 42508 ){
            return true
           } else {
            if( char < 40960 ){
             return char === 40899;
            } else {
             return char <= 41391;
            }
           }
          }
         }
        } else {
         if( char < 42775 ){
          if( char < 42607 ){
           if( char < 42594 ){
            if( char < 42560 ){
             return char >= 42528 && char <= 42537;
            } else {
             return char <= 42591;
            }
           } else {
            return char <= 42605;
           }
          } else {
           if( char < 42623 ){
            if( char < 42620 ){
             return char === 42607;
            } else {
             return char <= 42621;
            }
           } else {
            return char <= 42647;
           }
          }
         } else {
          if( char < 43010 ){
           if( char < 42891 ){
            if( char < 42786 ){
             return char >= 42775 && char <= 42783;
            } else {
             return char <= 42888;
            }
           } else {
            return char <= 42892;
           }
          } else {
           if( char === 43019 ){
            return true
           } else {
            if( char === 43014 ){
             return true
            } else {
             return char === 43010;
            }
           }
          }
         }
        }
       } else {
        if( char < 64275 ){
         if( char < 43335 ){
          if( char < 43216 ){
           if( char < 43188 ){
            if( char < 43136 ){
             return char >= 43043 && char <= 43047;
            } else {
             return char <= 43137;
            }
           } else {
            return char <= 43204;
           }
          } else {
           if( char < 43302 ){
            if( char < 43264 ){
             return char >= 43216 && char <= 43225;
            } else {
             return char <= 43273;
            }
           } else {
            return char <= 43309;
           }
          }
         } else {
          if( char < 43596 ){
           if( char === 43587 ){
            return true
           } else {
            if( char < 43561 ){
             return char >= 43335 && char <= 43347;
            } else {
             return char <= 43574;
            }
           }
          } else {
           if( char < 64256 ){
            if( char < 43600 ){
             return char >= 43596 && char <= 43597;
            } else {
             return char <= 43609;
            }
           } else {
            return char <= 64262;
           }
          }
         }
        } else {
         if( char < 65296 ){
          if( char < 65056 ){
           if( char < 65024 ){
            if( char === 64286 ){
             return true
            } else {
             return char >= 64275 && char <= 64279;
            }
           } else {
            return char <= 65039;
           }
          } else {
           if( char < 65101 ){
            if( char < 65075 ){
             return char >= 65056 && char <= 65062;
            } else {
             return char <= 65076;
            }
           } else {
            return char <= 65103;
           }
          }
         } else {
          if( char < 65345 ){
           if( char === 65343 ){
            return true
           } else {
            if( char < 65313 ){
             return char >= 65296 && char <= 65305;
            } else {
             return char <= 65338;
            }
           }
          } else {
           if( char < 65438 ){
            if( char === 65392 ){
             return true
            } else {
             return char >= 65345 && char <= 65370;
            }
           } else {
            return char <= 65439;
           }
          }
         }
        }
       }
      }
     }
    }
}
