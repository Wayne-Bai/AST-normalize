exports.level = {
  "goalTreeString": "{\"branches\":{\"master\":{\"target\":\"C1\",\"id\":\"master\",\"remoteTrackingBranchID\":\"o/master\"},\"o/master\":{\"target\":\"C1\",\"id\":\"o/master\",\"remoteTrackingBranchID\":null},\"bar\":{\"target\":\"C1\",\"id\":\"bar\",\"remoteTrackingBranchID\":null}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"}},\"HEAD\":{\"target\":\"master\",\"id\":\"HEAD\"},\"originTree\":{\"branches\":{\"master\":{\"target\":\"C1\",\"id\":\"master\",\"remoteTrackingBranchID\":null}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"}},\"HEAD\":{\"target\":\"master\",\"id\":\"HEAD\"}}}",
  "solutionCommand": "git push origin :foo;git fetch origin :bar",
  "startTree": "{\"branches\":{\"master\":{\"target\":\"C1\",\"id\":\"master\",\"remoteTrackingBranchID\":\"o/master\"},\"o/master\":{\"target\":\"C1\",\"id\":\"o/master\",\"remoteTrackingBranchID\":null},\"o/foo\":{\"target\":\"C1\",\"id\":\"o/foo\",\"remoteTrackingBranchID\":null}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"}},\"HEAD\":{\"target\":\"master\",\"id\":\"HEAD\"},\"originTree\":{\"branches\":{\"master\":{\"target\":\"C1\",\"id\":\"master\",\"remoteTrackingBranchID\":null},\"foo\":{\"target\":\"C1\",\"id\":\"foo\",\"remoteTrackingBranchID\":null}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"}},\"HEAD\":{\"target\":\"master\",\"id\":\"HEAD\"}}}",
  "name": {
    "en_US": "Source of nothing",
    "zh_CN": "没有 source",
    "zh_TW": "沒有 source",
    "es_AR": "Origen de nada",
    "pt_BR": "Origem vazia",
    "de_DE": "Die Quelle des Nichts",
    "ja"   : "無のsource",
    "fr_FR": "Source de rien du tout"
  },
  "hint": {
    "en_US": "The branch command is disabled for this level so you'll have to use fetch!",
    "zh_CN": "本节的 branch 命令被禁用了, 你只能使用 fetch! ",
    "zh_TW": "在本關卡中，不允許使用 branch 指令，因此你只能使用 fetch！",
    "es_AR": "El comando branch está deshabilitado para este nivel, así que ¡vas a tener que usar fetch!",
    "pt_BR": "O comando branch está desabilitado para este nível, então você terá de usar o fetch!",
    "de_DE": "Der branch Befehl ist für diesen Level inaktiv, du musst also fetch benutzen",
    "ja"   : "このレベルではbranchコマンドが無効になっているのでfetchを使うしかない！",
    "fr_FR": "La commande branch est désactivée pour ce niveau, vous devrez donc utiliser fetch !"
  },
  "startDialog": {
    "en_US": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Oddities of `<source>`",
              "",
              "Git abuses the `<source>` parameter in two weird ways. These two abuses come from the fact that you can technically specify \"nothing\" as a valid `source` for both git push and git fetch. The way you specify nothing is via an empty argument:",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "Let's see what these do..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "What does pushing \"nothing\" to a remote branch do? It deletes it!"
            ],
            "afterMarkdowns": [
              "There, we successfully deleted the `foo` branch on remote by pushing the concept of \"nothing\" to it. That kinda makes sense..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Finally, fetching \"nothing\" to a place locally actually makes a new branch"
            ],
            "afterMarkdowns": [
              "Very odd / bizarre, but whatever. That's git for you!"
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "This is a quick level -- just delete one remote branch and create a new branch with `git fetch` to finish!"
            ]
          }
        }
      ]
    },
    "fr_FR": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Les bizarreries de `<source>`",
              "",
              "Git maltraite le paramètre `<source>` parameter de deux façons bizarres. Ces deux abus viennent du fait que vous pouvez techniquement ne \"rien spécifier commre `source` valide pour git push et git fetch. Le moyen de ne rien spécifier est un argument vide :",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "Voyons ce que cela fait ..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Qu'est-ce que produit l'envoi de \"rien\" sur une branche distante ? Cela la détruit !"
            ],
            "afterMarkdowns": [
              "Ici, nous avons brillamment supprimé  la branche `foo` du dépôt distant en lui envoyant le concept de \"rien\". Cela prend du sens ..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Enfin, un fetch de \"rien\" dans un emplacement local crée une nouvelle branche"
            ],
            "afterMarkdowns": [
              "Très étrange, mais peu importe. C'est git !"
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "C'est un petit niveau -- supprimez simplement une branche distante et faites-en une nouvelle (locale) avec `git fetch` pour terminer !"
            ]
          }
        }
      ]
    },
    "es_AR": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Rarezas de `<origen>`",
              "",
              "Git abusa del parámetro `<origen>` de dos extrañas maneras. Estos dos abusos vienen del hecho de que tecnicamente podés especificar \"la nada\" como un `origen` válido tanto para git push como para git fetch. El modo de especificar la nada es a través de un parámetro vacío:",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "Veamos qué hacen estos..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "¿Qué hace el pushear \"nada\" a una rama remota? ¡La elimina!"
            ],
            "afterMarkdowns": [
              "Ahí está, borramos la rama `foo` exitosamente del remoto pusheándole el concepto de \"nada\". Tiene algo de sentido..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Finalmente, fetchear \"nada\" a un lugar local en realidad crea una nueva rama"
            ],
            "afterMarkdowns": [
              "Bastante bizarro, pero, meh, da igual. Así es git."
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Este es un nivel rápido: simplemente borrá una rama remota y creá una nueva usando `git fetch` para completarlo."
            ]
          }
        }
      ]
    },
    "pt_BR": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Coisas estranhas do `<origem>`",
              "",
              "O Git abusa do parâmetro `<origem>` de duas formas estranhas. Esses dois abusos vem do fato de que tecnicamente você pode especificar \"nada\" como uma `origem` válida tanto para o git push como para o git fetch. A forma como você especifica \"nada\" é por meio de um argumento vazio:",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "Vejamos o que esses comandos fazem..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "O que fazer push de \"coisa nenhuma\" para um ramo remoto significa? Deletar o ramo!"
            ],
            "afterMarkdowns": [
              "Aqui, excluímos com sucesso o ramo `foo` do repositório remoto por meio de um push de \"coisa nenhuma\" direcionado a ele. Até que faz sentido..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Finalmente, fazer um fetch de \"coisa nenhuma\" para uma referência local cria um novo ramo"
            ],
            "afterMarkdowns": [
              "Bastante estranho / bizarro, mas de qualquer forma. É assim que o Git é!"
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Este é um nível rápido de resolver -- basta remover um ramo remoto com `git push` e criar um novo ramo local com `git fetch` para terminar!"
            ]
          }
        }
      ]
    },
    "zh_TW": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "###`<source>` 奇怪的地方",
              "",
              "在兩個奇怪的情況下，git 不使用 `<source>` 參數，事實上，在`git push`以及`git fetch`的情況下，可以允許你\"不用\"指定` source`，你可以藉由把參數留空，來表示你不想指定 source：",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "讓我們來看看這些在做什麼..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "當*沒有*指定 source 的時候，`push` 對於 remote branch 做了什麼？`push`把它刪除掉了！"
            ],
            "afterMarkdowns": [
              "看吧，我們藉由把 source \"留空\"，成功用 `push` 刪除了 `foo` branch，這合理吧..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "最後，對於 `fetch` 來說，source \"留空\" 表示我們要在 local 上建立一個新的 branch。"
            ],
            "afterMarkdowns": [
              "很奇怪吧！但那正是 git 為你做的事情！"
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "這是一個很簡單的關卡，只需要利用 `git push` 刪除一個 remote 的 branch，並且利用 `git fetch` 建立一個新的 local 的 branch！"
            ]
          }
        }
      ]
    },
   "zh_CN":{
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### 奇葩的`<source>`",
              "",
              "有两种罕见的情况, git 不需要 `<source>`. 这基于这样一个事实-- 技术上说就是你不指定<source>. 这是通过空参数实现的",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "我们看看这是怎么进行的..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "如果给push传一个空参数会如何呢? 远端会删除分支! "
            ],
            "afterMarkdowns": [
              "就是这样子, 我们通过给push传空值source, 成功删除了远端的`foo`分支, 这真有意思..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "如果给fetch传空<source>, 那本地会创建一个新分支."
            ],
            "afterMarkdowns": [
              "很神奇吧! 但无论怎么说, 这就是git !"
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "快速测试 -- 删除远端的分支, 再在本地创建新的分支! "
            ]
          }
        }
      ]
    },
    "de_DE": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Die Eigentümlichkeiten von `<Quelle>`",
              "",
              "Git \"missbraucht\" den `<Quelle>`-Parameter in zwei Fällen. Diese rühren daher, dass man technisch gesehen \"nichts\" als gültige `<Quelle>` sowohl für `git push` als auch für `git fetch` angeben kann. Das macht man so:",
              "",
              "* `git push origin :side`",
              "* `git fetch origin :bugFix`",
              "",
              "Schauen wir, was das bewirkt ..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Was passiert, wenn man \"nichts\" auf einen entfernten Branch pusht? Er wird gelöscht!"
            ],
            "afterMarkdowns": [
              "Und schon haben wir `foo` erfolgreich auf dem Remote gelöscht, weil wir \"Leere\" darauf geschoben haben. Ist auf seine Weise irgendwie logisch ..."
            ],
            "command": "git push origin :foo",
            "beforeCommand": "git clone; git push origin master:foo"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Und weiter: indem man \"nichts\" von einem Remote in sein lokales Repository zieht, erstellt man tatsächlich einen neuen Branch."
            ],
            "afterMarkdowns": [
              "Ziemlich abgefahren / bizarr, aber was soll's. Das ist halt Git."
            ],
            "command": "git fetch origin :bar",
            "beforeCommand": "git clone"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Das ist ein kurzer Level -- lösch einfach den Remote Branch und erstelle einen neuen Branch mit `git fetch`, um ihn zu lösen."
            ]
          }
        }
      ]
    }
  }
};
