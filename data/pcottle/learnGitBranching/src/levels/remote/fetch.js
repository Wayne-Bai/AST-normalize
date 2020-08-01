exports.level = {
  "goalTreeString": "{\"branches\":{\"master\":{\"target\":\"C2\",\"id\":\"master\"},\"bugFix\":{\"target\":\"C3\",\"id\":\"bugFix\"},\"o/master\":{\"target\":\"C5\",\"id\":\"o/master\"},\"o/bugFix\":{\"target\":\"C7\",\"id\":\"o/bugFix\"}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"},\"C2\":{\"parents\":[\"C1\"],\"id\":\"C2\"},\"C3\":{\"parents\":[\"C1\"],\"id\":\"C3\"},\"C4\":{\"parents\":[\"C2\"],\"id\":\"C4\"},\"C6\":{\"parents\":[\"C3\"],\"id\":\"C6\"},\"C5\":{\"parents\":[\"C4\"],\"id\":\"C5\"},\"C7\":{\"parents\":[\"C6\"],\"id\":\"C7\"}},\"HEAD\":{\"target\":\"bugFix\",\"id\":\"HEAD\"},\"originTree\":{\"branches\":{\"master\":{\"target\":\"C5\",\"id\":\"master\"},\"bugFix\":{\"target\":\"C7\",\"id\":\"bugFix\"}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"},\"C2\":{\"parents\":[\"C1\"],\"id\":\"C2\"},\"C3\":{\"parents\":[\"C1\"],\"id\":\"C3\"},\"C4\":{\"parents\":[\"C2\"],\"id\":\"C4\"},\"C5\":{\"parents\":[\"C4\"],\"id\":\"C5\"},\"C6\":{\"parents\":[\"C3\"],\"id\":\"C6\"},\"C7\":{\"parents\":[\"C6\"],\"id\":\"C7\"}},\"HEAD\":{\"target\":\"bugFix\",\"id\":\"HEAD\"}}}",
  "solutionCommand": "git fetch",
  "startTree": "{\"branches\":{\"master\":{\"target\":\"C2\",\"id\":\"master\"},\"bugFix\":{\"target\":\"C3\",\"id\":\"bugFix\"},\"o/master\":{\"target\":\"C2\",\"id\":\"o/master\"},\"o/bugFix\":{\"target\":\"C3\",\"id\":\"o/bugFix\"}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"},\"C2\":{\"parents\":[\"C1\"],\"id\":\"C2\"},\"C3\":{\"parents\":[\"C1\"],\"id\":\"C3\"}},\"HEAD\":{\"target\":\"bugFix\",\"id\":\"HEAD\"},\"originTree\":{\"branches\":{\"master\":{\"target\":\"C5\",\"id\":\"master\"},\"bugFix\":{\"target\":\"C7\",\"id\":\"bugFix\"}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"},\"C2\":{\"parents\":[\"C1\"],\"id\":\"C2\"},\"C3\":{\"parents\":[\"C1\"],\"id\":\"C3\"},\"C4\":{\"parents\":[\"C2\"],\"id\":\"C4\"},\"C5\":{\"parents\":[\"C4\"],\"id\":\"C5\"},\"C6\":{\"parents\":[\"C3\"],\"id\":\"C6\"},\"C7\":{\"parents\":[\"C6\"],\"id\":\"C7\"}},\"HEAD\":{\"target\":\"bugFix\",\"id\":\"HEAD\"}}}",
  "name": {
    "en_US": "Git Fetchin'",
    "fr_FR": "Git fetch",
    "de_DE": "Git Fetch",
    "ja"   : "Git Fetch",
    "es_AR": "git fetch",
    "pt_BR": "Git Fetch",
    "zh_CN": "Git Fetch",
    "zh_TW": "git fetch"
  },
  "hint": {
    "en_US": "just run git fetch!",
    "fr_FR": "Exécuter juste git fetch",
    "de_DE": "Einfach git fetch ausführen!",
    "ja"   : "単にgit fetchを実行！",
    "es_AR": "Simplemente ¡hacé git fetch!",
    "pt_BR": "Simplesmente chame git fetch!",
    "zh_CN": "只要运行 git fetch 命令!",
    "zh_TW": "只要下 git fetch 指令"
  },
  "startDialog": {
    "en_US": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "## Git Fetch",
              "",
              "Working with git remotes really just boils down to transferring data _to_ and _from_ other repositories. As long as we can send commits back and forth, we can share any type of update that is tracked by git (and thus share work, new files, new ideas, love letters, etc.).",
              "",
              "In this lesson we will learn how to fetch data _from_ a remote repository -- the command for this is conveniently named `git fetch`.",
              "",
              "You'll notice that as we update our representation of the remote repository, our _remote_ branches will update to reflect that new representation. This ties into the previous lesson on remote branches"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Before getting into the details of `git fetch`, let's see it in action! Here we have a remote repository that contains two commits that our local repository does not have."
            ],
            "afterMarkdowns": [
              "There we go! Commits `C2` and `C3` were downloaded to our local repository, and our remote branch `o/master` was updated to reflect this."
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### What fetch does",
              "",
              "`git fetch` performs two main steps, and two main steps only. It:",
              "",
              "* downloads the commits that the remote has but are missing from our local repository, and...",
              "* updates where our remote branches point (for instance, `o/master`)",
              "",
              "`git fetch` essentially brings our _local_ representation of the remote repository into synchronization with what the _actual_ remote repository looks like (right now).",
              "",
              "If you remember from the previous lesson, we said that remote branches reflect the state of the remote repositories _since_ you last talked to those remotes. `git fetch` is the way you talk to these remotes! Hopefully the connection between remote branches and `git fetch` is apparent now.",
              "",
              "`git fetch` usually talks to the remote repository through the Internet (via a protocol like `http://` or `git://`).",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### What fetch doesn't do",
              "",
              "`git fetch`, however, does not change anything about _your_ local state. It will not update your `master` branch or change anything about how your file system looks right now.",
              "",
              "This is important to understand because a lot of developers think that running `git fetch` will make their local work reflect the state of the remote. It may download all the necessary data to do that, but it does _not_ actually change any of your local files. We will learn commands in later lessons to do just that :D",
              "",
              "So at the end of the day, you can think of running `git fetch` as a download step."
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "To finish the level, simply `git fetch` and download all the commits!"
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
              "## Git Fetch",
              "",
              "Travailler avec les dépôts gits distants réduit vraiment les transferts de données _depuis_ et _vers_ les autres dépôts. Du moment que nous pouvons envoyer des commits en avance et en retard, nous pouvons partager tous les types de mise-à-jours qui sont gérées par git (et donc partager le travail, de nouveaux fichiers, de nouvelles idées, des lettres d'amour, etc.).",
              "",
              "Dans cette leçon nous allons apprendre comment rapporter (fetch) des données _depuis_ un dépôt distant vers le nôtre -- la commande pour cela est malignement dénommée `git fetch`.",
              "",
              "Vous allez remarquer qu'au moment où nous mettons à jour notre version du dépôt distant, nos branches _distantes_ vont se mettre à jour pour refléter cette nouvelle représentation. Cela est lié à la leçon précédente sur les branches distantes."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Avant d'aller dans les détails de `git fetch`, voyons-le en action ! Ici nous avons un dépôt distant qui contient deux commits que notre dépôt local n'a pas."
            ],
            "afterMarkdowns": [
              "Voilà ! Les commits `C2` et `C3` ont été téléchargés dans notre dépôt local, et notre branche distante `o/master` a été mise à jour pour refléter cela."
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Ce que fetch fait",
              "",
              "`git fetch` procède en exactement deux principales étapes. Cela :",
              "",
              "* télécharge les commits que le dépôt distant possède mais qui ne sont pas dans le nôtre, et...",
              "* met-à-jour nos branches distantes (par exemple, `o/master`).",
              "",
              "`git fetch` prend en fait notre représentation _locale_ du dépôt distant pour la synchroniser avec ce à quoi le dépôt distant ressemble _réellement_ (à ce moment-là).",
              "",
              "Si vous vous rappelez de la précédente leçon, nous avons dit que les branches distantes reflètent l'état du dépôt distant _depuis_ la dernière fois que vous avez parlé à ces branches distantes. `git fetch` est le moyen de parler à ces branches distantes ! Heureusement la relation entre `git fetch` et les branches distantes est maintenant apparue.",
              "",
              "`git fetch` contacte le dépôt distant par Internet (via un protocole comme `http://` ou `git://`).",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Ce que fetch ne fait pas",
              "",
              "`git fetch`, cependant, ne change rien à propos de _vôtre_ état local. Il ne va pas mettre à jour vôtre branche `master` ou changer quelque chose comme les fichiers la représentation des fichiers.",
              "",
              "C'est important à comprendre car un nombre important de développeurs pensent qu'exécuter `git fetch` va rendre leur dépôt local dans le même état que le distant. Cela peut télécharger toutes les données nécessaires pour faire cela, mais cela ne change en réalité _rien_ sur vos fichiers locaux. Nous allons apprendre des commandes dans les niveaux suivants pour faire cela uniquement :D",
              "",
              "Ainsi à la fin de la journée, vous pouvez penser à `git fetch` comme une étape de téléchargement."
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Pour finir ce niveau, exécuter simplement `git fetch` et téléchargez tous les commits !"
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
              "## Git Fetch",
              "",
              "Trabajar con remotos en git en realidad se reduce a transferir datos _de_ y _hacia_ otros repositorios. Mientras podamos mandar commits de un lado al otro, podemos compartir cualquier tipo de actualización registrada por git (y, por ende, compartir trabajo, archivos nuevos, ideas nuevas, cartas de amor, etc).",
              "",
              "En esta lección aprenderemos cómo traer (hacer `fetch`) datos _desde_ un repositorio remoto - el comando para esto se llama, convenientemente, `git fetch`).",
              "",
              "Vas a notar que a medida que actualicemos nuestra representación de nuestro repositorio remoto, nuestras ramas _remotas_ van a actualizarse para reflejar esa nueva representación. Esto está ligado a la lección anterior sobre ramas remotas"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Antes de entrar en los detalles de `git fetch`, veámoslo en acción. Acá tenemos un repositorio remoto que contiene dos commits que nuestro repositorio local no tiene."
            ],
            "afterMarkdowns": [
              "¡Ahí vamos! Bajamos los commits `C2` y `C3` a nuestro repositorio local, y nuestra rama remota `o/master` fue actualizada para reflejar este cambio."
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### ¿Qué hace fetch?",
              "",
              "`git fetch` hace dos simples pasos, y sólo dos simples pasos:",
              "",
              "* baja los commits que el remoto tiene pero no están en nuestro repositorio local, y...",
              "* actualiza a dónde apuntan nuestras ramas remotas (por ejemplo, `o/master`)",
              "",
              "`git fetch` escencialmente sincroniza nuestra representación _local_ del repositorio remoto con el _verdadero_ estado del repositorio remoto (en este momento).",
              "",
              "Si recordás la lección anterior, dijimos que las ramas remotas reflejan el estado de los repositorios remotos _desde_ la última vez que hablaste con ellos. ¡`git fetch` es la manera en que hablás con esos remotos! Espero que ahora esté clara la conexión entre las ramas remotas y `git fetch`.",
              "",
              "Usualmente, `git fetch` habla con el repositorio a través de internet (usando un protocolo como `http://` o `git://`).",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### ¿Qué *no* hace fetch?",
              "",
              "Sin embargo, `git fetch` no modifica en absoluto _tu_ estado local. No va a actualizar tu rama `master` ni va a cambiar nada sobre cómo se ve tu sistema de archivos en este momento.",
              "",
              "Es importante entender esto, porque un montón de desarrolladores piensan que correr `git fetch` hará que su estado local refleje el estado del remoto. `git fetch` puede descargar los datos necesarios para hacerlo, pero *no* cambia ninguno de tus archivos locales. Vamos a aprender otros comandos para hacer eso más adelante :D",
              "",
              "Entonces, después de todo, podés pensar a `git fetch` como un paso de descarga."
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Para completar este nivel, simplemente corré `git fetch` y bajate todos los commits"
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
              "## Git Fetch",
              "",
              "Trabalhar com remotos no Git, no final das contas, se resume a transferir dados _de_ e _para_ outros repositórios. Desde que possamos enviar commits para um lado e para o outro, poderemos compartilhar qualquer tipo de atualização que seja gerenciada pelo Git (e portanto compartilhar trabalho, novos arquivos, novas ideias, cartas de amor, etc).",
              "",
              "Nesta lição vamos aprender como baixar dados _de_ um repositório remoto -- o comando para isso é convenientemente chamado de `git fetch`.",
              "",
              "Você perceberá que conforme atualizarmos a representação do repositório remoto, nossos ramos _remotos_ atualizar-se-ão para refletir essa nova representação. Isso tem a ver com o que vimos na lição anterior sobre ramos remotos"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Antes de entrar nos detalhes do `git fetch`, vejamo-no em ação! Aqui temos um repositório remoto que contém dois commits que nosso repositório local não possui."
            ],
            "afterMarkdowns": [
              "Lá vamos nós! Os commits `C2` e `C3` foram baixados para o nosso repositório local, e nosso ramo remoto `o/master` foi atualizado para refletir esse fato."
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### O que o fetch faz",
              "",
              "O `git fetch` realiza dois passos principais, e somente estes dois passos principais. Ele:",
              "",
              "* Baixa os commits que o repositório remoto possui mas que estão faltando no repositório local, e...",
              "* Atualiza a referência para a qual os ramos remotos (por exemplo, `o/master`) estão apontando",
              "",
              "O `git fetch` essencialmente faz com que nossa representação _local_ do repositório remoto fique sincronizada com a forma com que o repositório remoto _de fato_ se parece (naquele momento).",
              "",
              "Se você lembrar da lição anterior, nós dissemos que os ramos remotos refletem o estado dos repositórios remotos _desde a última vez_ na qual você falou com esses repositórios. O `git fetch` é a única forma de falar com esses repositórios remotos! Espero que a conexão entre os ramos remotos e o `git fetch` esteja clara agora.",
              "",
              "O `git fetch` geralmente conversa com o repositório remoto por meio da Internet (usando um protocolo como `http://` ou `git://`).",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### O que o fetch NÃO faz",
              "",
              "O `git fetch`, no entanto, não muda nada do estado _local_ do repositório. Ele não atualiza o seu ramo `master` nem muda nada na forma como o seu sistema de arquivos está no momento.",
              "",
              "É importante entender isso, pois muitos desenvolvedores pensam que executar `git fetch` fará com que o trabalho local reflita o estado do repositório remoto. Ele pode até baixar todos os dados necessários para fazê-lo, mas ele _não_ muda de fato nenhum dos arquivos locais. Vamos aprender comandos para fazê-lo nas lições a seguir :D",
              "",
              "No final das contas, você pode pensar no `git fetch` como um passo de download."
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Para terminar este nível, simplesmente execute `git fetch` e baixe todos os commits!"
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
              "## git fetch",
              "",
              "透過 git remote 其實就是把資料接收或傳送到其它的 repository，只要我們可以將資料傳進及傳出，我們就可以分享任何被 git 所追蹤的 repository 的更新（例如分享工作進度，新的檔案，新的想法，以及情書等等...）。",
              "",
              "在這個教學中，我們會學習到如何從 remote repository 來 fetch （抓取）資料，這個指令叫作 `git fetch`。",
              "",
              "你將會注意到當我們的 remote repository 更新的時候，相對應的 _remote_ branch 也會反應該更新，這個跟我們之前所提到的 remote branch 的特性是吻合的。"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "在講到 `git fetch` 的細節之前，我們要先來看一下例子！在這裡我們有一個新增了兩個 commit 的 remote repository，而且我們的 local repository 並沒有包含這兩個 commit。"
            ],
            "afterMarkdowns": [
              "看吧！commit `C2` 以及 `C3` 已經被下載到我們的 local repository，而且我們的 remote branch `o/master` 也更新了。"
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### fetch 做了什麼",
              "",
              "`git fetch` 只有執行了兩個主要步驟，包含：",
              "",
              "* 下載 remote 有的 commit，但是在我們的 local repository 是沒有該 commit。還有...",
              "* 更新我們 remote branch 所指向的地方（例如， `o/master`）",
              "",
              "基本上，`git fetch` 同步了我們的 local repository 以及 remote repository 的最新狀態。",
              "",
              "假如你還記得之前的教學的話，我們說過 remote branch 反應了 remote repository 的狀態，原因在於說你最後接觸的是這些 remote repository，而你就是利用 `git fetch` 來接觸這些 remote repository！現在 remote branch 跟 `git fetch` 的關係已經很明顯了。",
              "",
              "`git fetch` 通常是透過網路來跟 remote 溝通（透過一個 protocol （協定），例如 `http://` 或者是 `git://`）。",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### fetch 沒有做的事情",
              "",
              "然而，`git fetch` 並不會影響到在你的 local repository 中的 `master` branch，他並不會將你的 `master` branch 更新到最新的狀態。",
              "",
              "這個觀念很重要，因為很多程式設計師以為 `git fetch` 可以讓他們在 local repository 上面的工作跟 remote repository 的工作可以同步。它是會下載同步所需的資料，但是不會更新任何的檔案，我們會在後面的教學中提到如何做到這件事情。:D",
              "",
              "因此，你可以把 `git fetch` 想成是在下載資料。"
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "要完成這一關，只要透過 `git fetch` 並且下載全部的 commit 即可！"
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
              "## Git Fetch",
              "",
              "git remote可以归结为向其它仓库推送/拉取数据. 只要我们能回溯或前推提交, 我们就可以分享任何类型的被git跟踪的更新(工作, 新想法, 情书等等)",
              "",
              "本节课我们将学习 如何从远端仓库获取数据 -- 这个命令叫` git fetch`",
              "",
              "你会注意到当我们更新远端的仓库时, 我们的远端分支也会更新 并映射到最新的远端仓库."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "在解释`git fetch`前, 我们看看实例. 这里我们有一个包含了两个新提交的远端仓库, 这两新提交不存在于本地"
            ],
            "afterMarkdowns": [
              "就是这样了! `C2`,`C3`被下载到了本地仓库, 同时`o/master`被更新并映射到了这一变更 "
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### What fetch does",
              "",
              "`git fetch` 完成了两步:",
              "",
              "* 下载本地仓库未包含的提交对象",
              "* 更新我们的远端分支点(如, `o/master`)",
              "",
              "`git fetch` 实际上将本地对远端的映射 做了同步更新",
              "",
              "如果你还记得之前的课程, 我们说过远端分支映射了远端仓库的状态(你最后与远端通信的那一刻), `git fetch` 是你与远端交流的方式!",
              "",
              "`git fetch` 通常通过互联网(像 `http://` or `git://`) 与远端仓库通信.",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### fetch 不能做的事",
              "",
              "`git fetch`, 不能改变你的本地状态. 你不会更新你的`master` 或者 任何与文件系统相关的东西.",
              "",
              "所以, 你可以将`git fetch`的执行 视为下载"
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "要完成本节, 只需用`git fetch`下载所有的提交! "
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
              "## Git Fetch",
              "",
              "In Git mit entfernten Repositorys zu arbeiten lässt sich wirklich auf das Hin- und Zurückübertragen von Daten reduzieren. Solange wir Commits hin und her schicken können, können wir jede Art Update teilen, das von Git getrackt wird (und somit Arbeit, neue Dateien, neue Ideen, Liebesbriefe etc. teilen).",
              "",
              "In diesem Level werden wir lernen, wie man Daten _von_ einem entfernten Repository holt -- der entsprechende Befehl heißt praktischerweise `git fetch`.",
              "",
              "Dir wird auffallen, dass mit der Aktualisierung unserer Darstellung des entfernten Repositorys die _Remote_ Branches auf den neuesten Stand gebracht werden. Das passt zum vorherigen Level über Remote Branches."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Bevor wir uns die Einzelheiten von `git fetch` ansehen wollen wir es mal in Aktion sehen. Wir haben hier ein entferntes Repository, das zwei Commits hat die in unserem lokalen Repository fehlen."
            ],
            "afterMarkdowns": [
              "Das war's! Die Commits `C2` und `C3` wurden zu unserem Repository heruntergeladen und unser Remote Branch `o/master` wurde aktualisiert."
            ],
            "command": "git fetch",
            "beforeCommand": "git clone; git fakeTeamwork 2"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Was Fetch tut",
              "",
              "`git fetch` führt genau zwei Schritte aus:",
              "",
              "* Es lädt die Commits herunter, die im lokalen Repository fehlen, und ...",
              "* aktualisiert die Remote Branches wo nötig (zum Beispiel, `o/master`).",
              "",
              "`git fetch` synchronisiert im Prinzip unsere _lokale_ Abbildung des entfernten Repositorys mit dem wie das entfernte Repository _tatsächlich_ aussieht (in diesem Moment).",
              "",
              "Wie du dich vielleicht erinnerst, haben wir im letzten Level gesagt, dass die Remote Branches den Zustand der Branches auf dem entfernten Repository darstellen _seit_ du das letzte Mal dieses Repository angesprochen hast. `git fetch` ist die Methode mit der du das Repository ansprichst! Der Zusammenhang zwischen Remote Branches und `git fetch` ist damit hoffentlich klar.",
              "",
              "`git fetch` kommuniziert mit dem entfernten Repository in der Regel über das Internet (über ein Protokoll wie `http://` oder `git://`).",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "### Was Fetch nicht tut",
              "",
              "`git fetch` ändert allerdings überhaupt nichts an _deinen_ lokalen Branches. Es aktualisiert nicht deinen `master` oder ändert irgendetwas an deinem Checkout.",
              "",
              "Das ist wichtig zu wissen, denn eine Menge Entwickler glauben, wenn sie `git fetch` ausführen würden ihre lokalen Branches auf den Stand des entfernten Repositorys gebracht. Es lädt zwar alle Daten herunter, damit man diese Aktualisierung durchführen kann, aber es ändert _nichts_ an deinen lokalen Branches. Wir werden in späteren Level Befehle genau dafür kennenlernen. :D",
              "",
              "Am Ende des Tages kannst du dir `git fetch` also als den Donwload-Schritt vorstellen."
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Um diesen Level zu schaffen musst du einfach nur `git fetch` ausführen, um alle Commits herunterzuladen!"
            ]
          }
        }
      ]
    }
  }
};
