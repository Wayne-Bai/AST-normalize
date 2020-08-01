exports.level = {
  "goalTreeString": "%7B%22branches%22%3A%7B%22master%22%3A%7B%22target%22%3A%22C3%27%22%2C%22id%22%3A%22master%22%2C%22remoteTrackingBranchID%22%3A%22o/master%22%2C%22localBranchesThatTrackThis%22%3Anull%7D%2C%22o/master%22%3A%7B%22target%22%3A%22C3%27%22%2C%22id%22%3A%22o/master%22%2C%22remoteTrackingBranchID%22%3Anull%2C%22localBranchesThatTrackThis%22%3A%5B%22master%22%5D%7D%7D%2C%22commits%22%3A%7B%22C0%22%3A%7B%22parents%22%3A%5B%5D%2C%22id%22%3A%22C0%22%2C%22rootCommit%22%3Atrue%7D%2C%22C1%22%3A%7B%22parents%22%3A%5B%22C0%22%5D%2C%22id%22%3A%22C1%22%7D%2C%22C3%22%3A%7B%22parents%22%3A%5B%22C1%22%5D%2C%22id%22%3A%22C3%22%7D%2C%22C2%22%3A%7B%22parents%22%3A%5B%22C1%22%5D%2C%22id%22%3A%22C2%22%7D%2C%22C3%27%22%3A%7B%22parents%22%3A%5B%22C2%22%5D%2C%22id%22%3A%22C3%27%22%7D%7D%2C%22HEAD%22%3A%7B%22target%22%3A%22master%22%2C%22id%22%3A%22HEAD%22%7D%2C%22originTree%22%3A%7B%22branches%22%3A%7B%22master%22%3A%7B%22target%22%3A%22C3%27%22%2C%22id%22%3A%22master%22%2C%22remoteTrackingBranchID%22%3Anull%2C%22localBranchesThatTrackThis%22%3Anull%7D%7D%2C%22commits%22%3A%7B%22C0%22%3A%7B%22parents%22%3A%5B%5D%2C%22id%22%3A%22C0%22%2C%22rootCommit%22%3Atrue%7D%2C%22C1%22%3A%7B%22parents%22%3A%5B%22C0%22%5D%2C%22id%22%3A%22C1%22%7D%2C%22C2%22%3A%7B%22parents%22%3A%5B%22C1%22%5D%2C%22id%22%3A%22C2%22%7D%2C%22C3%27%22%3A%7B%22parents%22%3A%5B%22C2%22%5D%2C%22id%22%3A%22C3%27%22%7D%7D%2C%22HEAD%22%3A%7B%22target%22%3A%22master%22%2C%22id%22%3A%22HEAD%22%7D%7D%7D",
  "solutionCommand": "git clone;git fakeTeamwork;git commit;git pull --rebase;git push",
  "startTree": "{\"branches\":{\"master\":{\"target\":\"C1\",\"id\":\"master\",\"remoteTrackingBranchID\":null,\"localBranchesThatTrackThis\":null}},\"commits\":{\"C0\":{\"parents\":[],\"id\":\"C0\",\"rootCommit\":true},\"C1\":{\"parents\":[\"C0\"],\"id\":\"C1\"}},\"HEAD\":{\"target\":\"master\",\"id\":\"HEAD\"}}",
  "name": {
    "en_US": "Diverged History",
    "zh_CN": "分散的历史",
    "zh_TW": "diverged history",
    "es_AR": "Historia divergente",
    "pt_BR": "Histórico divergente",
    "de_DE": "Abweichende History",
    "fr_FR": "Historique divergent",
    "ja"   : "履歴の分岐"
  },
  "hint": {
    "en_US": "check out the ordering from the goal visualization",
    "zh_CN": "检出可视化目标中的顺序",
    "zh_TW": "確認視覺化的目標中的順序",
    "es_AR": "Prestá atención al orden del objetivo",
    "ot_BR": "Preste atenção na ordem da visualização do objetivo",
    "de_DE": "Beachte die Reihenfolge in der Zieldarstellung",
    "ja"   : "ゴールのビジュアライズの順番を参照",
    "fr_FR": "regardez l'ordre dans la fenêtre de visualisation d'objectif"
  },
  "startDialog": {
    "en_US": {
      "childViews": [
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "## Diverged Work",
              "",
              "So far we've seen how to `pull` down commits from others and how to `push` up our own changes. It seems pretty simple, so how can people get so confused?",
              "",
              "The difficulty comes in when the history of the repository *diverges*. Before discussing the details of this, let's see an example...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Imagine you clone a repository on Monday and start dabbling on a side feature. By Friday you are ready to publish your feature -- but oh no! Your coworkers have written a bunch of code during the week that's made your feature out of date (and obsolete). They've also published these commits to the shared remote repository, so now *your* work is based on an *old* version of the project that's no longer relevant.",
              "",
              "In this case, the command `git push` is ambiguous. If you run `git push`, should git change the remote repository back to what it was on Monday? Should it try to add your code in while not removing the new code? Or should it totally ignore your changes since they are totally out of date?",
              "",
              "Because there is so much ambiguity in this situation (where history has diverged), git doesn't allow you to `push` your changes. It actually forces you to incorporate the latest state of the remote before being able to share your work."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "So much talking! Let's see this situation in action"
            ],
            "afterMarkdowns": [
              "See? Nothing happened because the command fails. `git push` fails because your most recent commit `C3` is based off of the remote at `C1`. The remote has since been updated to `C2` though, so git rejects your push"
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "How do you resolve this situation? It's easy, all you need to do is base your work off of the most recent version of the remote branch.",
              "",
              "There are a few ways to do this, but the most straightforward is to move your work via rebasing. Let's go ahead and see what that looks like."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Now if we rebase before pushing instead..."
            ],
            "afterMarkdowns": [
              "Boom! We updated our local representation of the remote with `git fetch`, rebased our work to reflect the new changes in the remote, and then pushed them with `git push`"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Are there other ways to update my work when the remote repository has been updated? Of course! Let's check out the same thing but with `merge` instead.",
              "",
              "Although `git merge` doesn't move your work (and instead just creates a merge commit), it's a way to tell git that you have incorporated all the changes from the remote. This is because the remote branch is now an *ancestor* of your own branch, meaning your commit reflects all commits in the remote branch.",
              "",
              "Lets see this demonstrated..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Now if we merge instead of rebasing..."
            ],
            "afterMarkdowns": [
              "Boom! We updated our local representation of the remote with `git fetch`, *merged* the new work into our work (to reflect the new changes in the remote), and then pushed them with `git push`"
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Awesome! Is there any way I can do this without typing so many commands?",
              "",
              "Of course -- you already know `git pull` is just shorthand for a fetch and a merge. Conveniently enough, `git pull --rebase` is shorthand for a fetch and a rebase!",
              "",
              "Let's see these shorthand commands at work."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "First with `--rebase`..."
            ],
            "afterMarkdowns": [
              "Same as before! Just a lot shorter."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "And now with regular `pull`"
            ],
            "afterMarkdowns": [
              "Again, exact same as before!"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "This workflow of fetching, rebase/merging, and pushing is quite common. In future lessons we will examine more complicated versions of these workflows, but for now let's try this out.",
              "",
              "In order to solve this level, take the following steps:",
              "",
              "* Clone your repo",
              "* Fake some teamwork (1 commit)",
              "* Commit some work yourself (1 commit)",
              "* Publish your work via *rebasing*"
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
              "## Travail divergeant",
              "",
              "Jusqu'à présent nous avons vu comment rapatrier (`pull`) les commits des collaborateurs et comment envoyer les vôtres (`push`). Cela a l'air simple, alors comment certains peuvent être si perdus ?",
              "",
              "La difficulté arrive quand l'historique du dépôt *diverge*. Avant d'aborder les détails de cela, voyons un exemple ...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Imaginez que vous clonez un dépôt le lundi et commencez à bidouiller une nouvelle fonctionnalité. Le vendredi vous êtes prêt à publier votre fonctionnalité -- mais oh nan ! Vos collègues ont écrit une floppée de code durant la semaine ce qui rend votre fonctionnalité désuète (et obsolète). Ils ont aussi publié sur le dépôt distant partagé, donc maintenant *votre* travail est basé sur une *vieille* version du projet qui n'est plus viable.",
              "",
              "Dans ce cas, la commande `git push` est ambiguë. Si vous exécutez `git push`, git devrait-il remettre le dépôt distant tel qu'il était lundi ? Doit-il essayer d'ajouter votre code sans supprimer le nouveau code ? Ou doit-il totalement ignorer vos changements puisqu'ils ne sont plus à jour ?",
              "",
              "Comme il y a trop d'ambiguïté dans cette situation (où l'historique a divergé), git ne vous autorise pas à `push` vos changements. Cela vous force en fait à incorporer le dernier état du dépôt distant avnat de pouvoir partager votre travail."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Assez parlé ! Observons cette situation en action"
            ],
            "afterMarkdowns": [
              "Vous voyez ? Rien ne s'est produit car la commande a échoué. `git push` a échoué car votre plus récent commit `C3` est basé sur le dépôt distant sur `C1`. Le dépôt distant a depuis été mis à jour avec `C2`, donc git rejette votre push."
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Comment vous résolvez cette situation ? C'est facile, tout ce que vous avez à faire est de baser votre travail sur la dernière version de la branche distante.",
              "",
              "Il y a plusieurs façons de faire cela, mais la plus directe est de déplacer votre travail avec rebase. Allons voir à quoi cela ressemble."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Maintenant si nous rebasons avant de push ..."
            ],
            "afterMarkdowns": [
              "Boum ! Nous avons mis à jour notre représentation locale du dépôt avec `git fetch`, rebasé notre travail pour refléter les nouveaux changements, et enfin les avons envoyés avec `git push`"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Existe-t-il d'autres façons de mettre à jour notre travail quand le répertoire distant a été mis à jour ? Bien sûr ! Faisons la même chose avec `merge` plutôt.",
              "",
              "Bien que `git merge` ne déplace pas vôtre travail (et au lieu de cela crée juste un commit de fusion), c'est une façon de dire à git que vous avez incorporé tous les changements du dépôt distant. C'est parce que la branche distante est maitenant une *ancêtre* de vôtre propre branche, ce qui signifie que vos commits reflètent tous les changements faits sur la branche distante.",
              "",
              "Voyons une démonstration ..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Maintenant si nous mergeons au lieu de rebaser ..."
            ],
            "afterMarkdowns": [
              "Boum ! Nous avons mis à jour notre représentation du dépôt distant avec `git fetch`, *fusionné* le nouveau travail dans notre travail (pour refléter les nouveaux changements du dépôt distant), et les avons ensuite envoyés avec `git push`"
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Impressionnant ! Existe-t-il une façon de faire sans taper autant de commandes ?",
              "",
              "Bien sûr -- vous savez déjà que `git pull` est simplement un raccourci pour un fetch puis un merge. De manière assez pratique, `git pull --rebase` est un raccourci pour un fetch puis un rebase !",
              "",
              "Voyons ce raccourci au travail."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Premièrement avec  `--rebase`..."
            ],
            "afterMarkdowns": [
              "Comme avant ! Juste un peu plus court."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Et maintenant avec un `pull` normal"
            ],
            "afterMarkdowns": [
              "Encore une fois, exactement la même chose qu'avant !"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Cette succession de fetch, rebase/merge, et push est assez commune. Dans les leçons suivantes, nous allons explorer plus profondément cette façon de d'enchaîner les commandes, mais essayons plutôt cela maintenant.",
              "",
              "Pour finir ce niveau, réalisez les étapes suivantes :",
              "",
              "* Clonez votre dépôt",
              "* Simuler un travail d'équipe (1 commit)",
              "* Commitez un peu de votre travail (1 commit)",
              "* Publiez votre travail avec *rebase*"
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
              "## Trabajo divergente",
              "",
              "Hasta acá vimos cómo pullear commits de otros y cómo pushear los nuestros. Parece bastante simple, así que ¿cómo puede confundirse tanto la gente?",
              "",
              "La dificultad viene cuando la historia de los repositorios *diverge*. Antes de entrar en detalles, veamos un ejemplo...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Imaginate que clonás un repositorio el lunes y empezás a desarrollar algo. Para el viernes ya estás listo para publicar tu trabajo, pero, ¡oh, oh! Tus colegas también escribieron código durante la semana, haciendo que tu trabajo quede desactualizado (y obsoleto). Además, ellos publicaron esos commits en el repositorio remoto, así que ahora *tu* trabajo está basado en una versión *vieja* del proyecto, que ya no le interesa a nadie.",
              "",
              "En este caso, el comando `git push` es ambiguo. Si corrés `git push`, ¿git debería cambiar el repositorio a como estaba el lunes? ¿Debería tratar de agregar tu código sin eliminar el código nuevo? ¿O debería ignorar completamente tus cambios porque están desactualizados?",
              "",
              "Como hay tanta ambiguedad en esta situación (en que la historia divirgió), git no te permite pushear tus cambios. En cambio, te fuerza a integrar el último estado del repositorio remoto antes de poder compartir tu trabajo."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "¡Demasiada charla, veámoslo en acción!"
            ],
            "afterMarkdowns": [
              "¿Ves? No pasó nada, porque el comando falla. `git push` falla porque `C3`, tu commit más reciente, está basado en el remoto sobre `C1`. El remoto fue actualizado a `C2` desde entonces, por lo que git rechaza tu push"
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "¿Cómo resolvés esta situación? Es fácil, todo lo que tenés que hacer es basar tu trabajo en la versión más reciente de la rama remota.",
              "",
              "Hay un par de maneras de hacer esto, pero la más simple es mover tu trabajo haciendo un rebase. Probémoslo a ver cómo se ve."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Ahora, si mejor rebaseamos antes de pushear..."
            ],
            "afterMarkdowns": [
              "¡Boom! Actualizamos nuestra representación local del remoto con `git fetch`, rebaseamos nuestro trabajo para reflejar los nuevos cambios del remoto, y después los pusheamos con `git push`"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "¿Hay otra manera de actualizar mi trabajo si actualizaron el repositorio remoto? ¡Claro que sí! Veamos cómo hacer lo mismo pero usando `merge`.",
              "",
              "Por más que `git merge` no mueva tu trabajo (sólo crea un commit de merge), es un modo de decirle a git que integraste todos los cambios del remoto. Esto es porque ahora una rama remota pasó a ser un *ancestro* de tu propia rama, lo que significa que tu commit refleja los cambios de todos los commits de la rama remota.",
              "",
              "Veamos una muestra..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Si en lugar de rebasear hacemos un merge..."
            ],
            "afterMarkdowns": [
              "¡Boom! Actualizamos nuestra representación local del remoto usando `git fetch`, *mergeamos* el nuevo trabajo junto con el nuestro (para reflejar los nuevos cambios en el remoto), y después los pusheamos usando `git push`"
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "¡Asombroso! ¿Hay forma de hacer esto sin tipear tantos comandos?",
              "",
              "¡Claro que sí! Ya sabés que `git pull` es simplemente un atajo para hacer fetch y merge. Convenientemente, ¡`git pull --rebase` es un atajo para hacer fetch y rebase!",
              "",
              "Veamos estos atajos funcionando."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Primero con `--rebase`..."
            ],
            "afterMarkdowns": [
              "¡Igual que antes! Sólo que bastante más corto."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Y ahora un `pull` común"
            ],
            "afterMarkdowns": [
              "Otra vez, ¡exactamente lo mismo que antes!"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Toda esta movida de fetchear, rebasear/mergear y pushear es bastante común. En lecciones futuras vamos a ver formas más complejas de estos flujos de trabajo, pero por ahora probemos esto que vimos.",
              "",
              "Para resolver este nivel, hacé lo siguiente:",
              "",
              "* Cloná tu repositorio",
              "* Simulá algo de trabajo de un colega (1 commit)",
              "* Commiteá algo de trabajo propio (1 commit)",
              "* Publicá tu trabajo *rebaseando*"
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
              "## Histórico Divergente",
              "",
              "Até o momento vimos como fazer `pull` de commits dos outros e como fazer `push` de nossas próprias mudanças. Parece ser tão simples, como será que as pessoas ficam tão confusas?",
              "",
              "A dificuldade aparece quando o histórico do repositório *diverge*. Antes de discutir os detalhes disso, vejamos um exemplo...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Imagine que você clonou um repositório na segunda-feira e começou a trabalhar em uma funcionalidade nova. Na sexta-feira você está pronto para publicar a funcionalidade -- mas, ah não! Seus colegas escreveram um bocado de código durante a semana, tornando a sua funcionalidade obsoleta. Eles também publicaram esses commits no repositório remoto que vocês compartilham, então agora o *seu* trabalho é baseado em uma versão *antiga* do projeto, que não é mais relevante.",
              "",
              "Neste caso, o comando `git push` é ambíguo. Se você executar `git push`, será que o Git deveria tratar o repositório remoto como se ele ainda estivesse no estado da segunda-feira? Será que ele deveria tentar adicionar seu código dentro do repositório sem tentar remover o código novo? Ou será que ele deveria simplesmente ignorar suas mudanças totalmente, já que elas estão obsoletas?",
              "",
              "Devido à grande ambiguidade que surge neste tipo de situação (quando a história divergiu), o Git não permite que você faça `push` das suas mudanças. Ele, de fato, força você a incorporar o último estado do repositório remoto antes de conseguir compartilhar o seu trabalho."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Chega de conversa! Vejamos essa situação na prática"
            ],
            "afterMarkdowns": [
              "Viu? Nada aconteceu porque o comando falhou. O `git push` falha porque o commit mais recente (`C3`) é baseado no remoto em `C1`. Como o remoto foi atualizado no meio tempo, o Git rejeita o push"
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Como resolver essa situação? É fácil, tudo que você precisa fazer é basear seu trabalho na versão mais recente do ramo remoto.",
              "",
              "Existem algumas maneiras de fazer isso, mas a mais direta é mover o seu trabalho usando rebase. Vamos em frente, ver como isso é feito."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Agora se nós fizermos um rebase antes do push..."
            ],
            "afterMarkdowns": [
              "Boom! Nós atualizamos a representação local do repositório remoto com `git fetch`, fizemos rebase do nosso trabalho para refletir as novas mudanças no repositório remoto, e então enviamos nossas mudanças com `git push`"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Será que existem outras formas de compartilhar meu trabalho quando o repositório remoto tiver sido atualizado? Claro! Vamos fazer a mesma tarefa usando `merge` em vez de `rebase`.",
              "",
              "Embora o `git merge` não mova o seu trabalho (em vez disso, ele cria um commit de merge), ele é uma forma de contar ao Git que você incorporou todas as mudanças do repositório remoto. Isso acontece porque o ramo remoto passa a ser um *ancestral* do seu próprio ramo, significando que o seu commit reflete todos os commits contidos no ramo remoto.",
              "",
              "Vejamos uma demonstração..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Agora se fizermos merge em vez de rebase ..."
            ],
            "afterMarkdowns": [
              "Boom! Atualizamos nossa representação local do repositório remoto com `git fetch`, fizemos *merge* do novo trabalho com o nosso (para refletir as novas mudanças no repositório remoto), e então fizemos push deles com `git push`"
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Incrível! Existe alguma forma de fazer isso sem digitar tantos comandos?",
              "",
              "É claro -- você já conhece o `git pull` e ele é simplesmente um atalho para um fetch e um merge. Convenientemente, entretanto, o comando `git pull --rebase` é uma abreviação para um fetch e um rebase!",
              "",
              "Vejamos esses dois comandos em ação."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Primeiro com `--rebase`..."
            ],
            "afterMarkdowns": [
              "Mesma coisa que antes! Porém muito mais curto."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "E agora com o `pull` normal"
            ],
            "afterMarkdowns": [
              "De novo, exatamente como antes!"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Esse fluxo de trabalho de fazer fetch, rebase/merge, e push é bastante comum. Em lições futuras vamos examinar versões mais complicadas desses fluxos de trabalho, mas por enquanto vamos tentar o seguinte.",
              "",
              "Para resolver este nível, faça o seguinte:",
              "",
              "* Clone o repositório",
              "* Simule trabalho de seus colegas (1 commit)",
              "* Faça um commit seu (1 commit)",
              "* Publique seu trabalho usando *rebase*"
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
              "## Diverged Work",
              "",
              "到目前為止我們已經知道如何 `pull` 其他人所送的 commit，而且也知道如何 `push` 我們自己的 commit，感覺很簡單，但是為什麼有人看起來很困惑？",
              "",
              "當 repo 的歷史紀錄是 *diverge（branch 走向不同）* 的狀態時就會很棘手，在討論這個之前，讓我們先來看一個例子...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "想像一下你在星期一的時候 clone 了一個 repo，並且開始在設計一個功能，在星期五的時候你準備好要發佈你的新功能，但是非常不幸地，你的同事已經寫了一連串的程式碼並且已經將 commit 發佈到 remote，所以現在*你的*進度是在一個比較*舊*的版本的後面（如果與 remote 比較的話啦！）。",
              "",
              "在這種情況底下，使用 `git push` 會有問題，如果你使用 `git push`，那麼 git 應該要把 remote 退回到星期一的狀態？它應該要把你所寫好的程式碼一起更新進去，同時不會影響你的同事寫好的程式碼？或者是他應該要因為版本比較舊而完全忽略你的程式碼？",
              "",
              "因為在這種情況下會很麻煩（當 git 歷史紀錄被 diverge 了），所以 git 不會允許你 `push` 你的 commit。在你上傳你的 commit 之前，它實際上會先強迫你先跟 remote 同步。"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "講太多了啦！讓我們實際看一下這個情況。"
            ],
            "afterMarkdowns": [
              "看到了沒？因為指令失敗了，所以沒有任何事情發生。 `git push` 失敗的原因是因為你最近的 commit `C3` 是在 `C1` 的後面，但是 remote 那邊是 `C2` 在 `C1` 的後面，所以 git 才會拒絕你的 push。"
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "你要如何解決這種情況？很簡單，你只需要把 `C3` 接在 remote 最新的版本 `C2` 的後面就可以了。",
              "",
              "有一些方法可以做到，但是最直接的方式是用 rebase，我們來做看看。"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "在我們 push 之前，先來做 rebase..."
            ],
            "afterMarkdowns": [
              "看吧！我們利用 `git fetch` 下載了 remote 上面的 commit，並且 rebase 我們的 commit，使得我們的 commit 可以接在 remote 上面最新的版本的後面，接著透過 `git push` 就可以上傳更新了。"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "在 remote 已經率先更新之後，還有沒有其它方法可以上傳我們的 commit？當然有阿！我們這次利用 `merge` 來做看看！",
              "",
              "雖然 `git merge` 並不會去移動你的 commit（反而會產生一個 merge commit），這是一個告訴 git 你已經下載了 remote 上面的 commit 並且在 local repo 中已經做完 merge，而因為 remote branch 上的最新的 commit 現在已經是 merge commit 的一個 *ancestor*，這就表示你的 commit 已經包含了在 remote branch 上的所有 commit。",
              "",
              "讓我們來看一下這種情況..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "現在假設我們不是用 rebase，而是用 merge..."
            ],
            "afterMarkdowns": [
              "看吧！我們藉由 `git fetch` 把 remote 上的 commit 下載下來，並且 *merged* 該 commit 到我們目前的 branch（這樣就表示我們產生的 merge commit 有包含了 remote　上的 commit），接著再透過 `git push` 上傳到 remote。"
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "太棒了! 有沒有其它可以不用打這麼多指令的方法？",
              "",
              "當然有阿！你已經知道 `git pull` 就是表示一個 fetch 跟一個 merge。 有一個指令非常方便，那就是 `git pull --rebase`，它表示的是一個 fetch 以及一個 rebase。",
              "",
              "我們來看如何使用這個簡化後的指令。"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "首先 `--rebase`..."
            ],
            "afterMarkdowns": [
              "跟之前一樣！只是少打了很多指令。"
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "現在用一般的 `pull`"
            ],
            "afterMarkdowns": [
              "又來了，剛好跟之前的一樣！"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "fetch，rebase/merge，以及 push 的流程是幾乎一樣的。在之後的教學中我們會看到比這些流程更複雜的版本。但是現在讓我們先牛刀小試一下。",
              "",
              "為了要完成這一關，請按照下面的步驟：",
              "",
              "* clone 你的 repo",
              "* 假裝送一個 commit 給 remote",
              "* 送一個 commit 給 local repo",
              "* 透過 *rebase* 送自己的 commit"
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
              "## 分散工作",
              "",
              "到现在我们已经知道了如何从其它地方`pull`,以及如何`push`我们自己的提交对象, 看起来真简单, 但是为何人们还会如此困惑呢?",
              "",
              "困难来自于远端库历史的分散. 在讨论这个问题的细节前, 我们看一个例子...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "想象一下你周一克隆了一个仓库, 然后在一个特性分支上工作. 到周五时, 你准备推送你的特性分支 -- 不行的! 你的同事这周写了一堆代码, 使得你的特性分支过期了. 他们已经将代码分享(合并)到远端仓库了, 所以你的工作就变成了基于仓库老版的代码了.",
              "",
              "这种情况下, `git push`就变得模糊了, 如果你执行`git push`, git应该让远端仓库回到星期一那天? 还是直接在新代码的基础上添加你的代码? 或者直接忽略你的提交? ",
              "",
              "因为这情况让问题变得模糊(因为历史的分散性)了, git 不会允许你`push`. 你只能先合并远端最新的代码, 然后才能分享你的工作."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "废话说得真多, 看看实际案例吧!"
            ],
            "afterMarkdowns": [
              "看见了吧? 什么都没有变, 命令失败了! `git push`的失败是因为你最新提交了`C3`(基于远端的`C1`). 而远端已经更新到了`C2`啦, 所以git 拒绝了你的push"
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "你如何解决这事儿呢? 很简单, 你需要做的就是使你的工作基于最新的远端分支.",
              "",
              "有好些方法做到这一点呢. 不过最直接的方法就是通过rebase修订你的工作. 我们继续向前,看看这是怎么实现的!"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "如果我们在push之前做rebase呢?"
            ],
            "afterMarkdowns": [
              "轰 啊 轰! 我们用`git fetch`更新了远端在本地的副本, 然后合并我们的工作以映射远端的新变化, 最后再`git push`"
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "还有其它的方法应对此种情况吗? 当然了, 我们还可以使用`merge`",
              "",
              "尽管`git merge`不会转移你的工作(相反的它会创建新的合并提交), 它会告诉git 你已经合并了远端的所有变更 -- 远端分支就是你自己分支的祖先, 这意味着, 你的提交反映了远端分支的提交.",
              "",
              "看下演示..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "那如果我们用merge 替换rebase呢?"
            ],
            "afterMarkdowns": [
              "轰哦轰! 我们用`git fetch`更新了远端副本, 然后合并了新变更到我们的工作, 最后我们用`git push`把工作推送回去."
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "漂亮! 有更简单的命令吗?",
              "",
              "当然 -- 就是你所知道`git pull`,  就是fetch 和merge 的简写. 更方便的 -- `git pull --rebase` 就是 fetch 和rebase的简写! ",
              "",
              "让我们看看简写命令是如何工作的."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "First with `--rebase`..."
            ],
            "afterMarkdowns": [
              "跟之前结果一样, 就是简写啦."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "换用常规的`pull`"
            ],
            "afterMarkdowns": [
              "还是跟以前一样! "
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "这几个命令 fetching, rebase/merging,  pushing 的工作流很普遍. 后续课程我们会讲解更复杂的工作流, 不过现在我们先尝试下吧.",
              "",
              "要完成本节, 你需要完成以下几步: ",
              "",
              "* Clone 你的仓库",
              "* 模拟一次远程提交(fakeTeamwork)",
              "* 本地提交一次",
              "* 用**变基**提交你的修改(--rebase)"
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
              "## Abweichende Inhalte",
              "",
              "Bisher haben wir gesehen wie man per `pull` Commits von Anderen ins lokale Repository holt und die eigenen Änderungen in ein entferntes `push`t. Ist doch ziemlich einfach, wie kann man da durcheinander kommen?",
              "",
              "Die Schwierigkeiten entstehen, wenn die Historys der beiden Repositorys *divergieren*, also voneinander abweichen. Bevor wir die Einzelheiten besprechen, schauen wir uns ein Beispiel an ...",
              ""
            ]
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Stell dir vor du holst dir Montags ein Repository per `clone` und fängst an, an einem Feature zu arbeiten. Bis Freitag soll es fertig und veröffentlicht sein -- doch, oh je! Deine Kollegen haben eine Menge Code während der Woche geschrieben, der dein Feature hat veralten lassen (und überflüssig gemacht hat). Sie haben diesen Code außerdem zum entfernten Repository gepusht, und dadurch basiert *deine* harte Arbeit jetzt auf einer *alten* Version des Projektes, die nicht länger relevant ist.",
              "",
              "In diesem Fall ist ein `git push` problematisch. Wenn du es ausführst, soll Git das entfernte Repository in den Zustand von Montag zurückversetzen? Soll es versuchen deinen Code auf die aktuelle Version zu packen? Oder soll es deine Änderungen einfach ignorieren, weil sie total veraltet sind?",
              "",
              "Da es in dieser Situation so viele Mehrdeutigkeiten gibt (da die Historys divergent sind) erlaubt Git dir nicht, deine Änderungen einfach zu `push`en. Es zwingt dich, zuerst die neuesten Änderungen vom Server zu holen und in deine zu integrieren bevor du deine Arbeit mit anderen teilen kannst."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Bla bla bla. Schauen wir uns das lieber in Aktion an:"
            ],
            "afterMarkdowns": [
              "Siehst du? Nichts passiert, weil der Befehl fehlschlägt. `git push` schlägt fehl, weil der neueste Commit `C3` auf dem Commit `C1` des Remotes basiert. Der entfernte Server hat mittlerweile jedoch `C2` gepusht bekommen, also lässt Git deinen Push jetzt nicht mehr zu."
            ],
            "command": "git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Wie sollen wir das auflösen? Es ist ganz einfach, du musst deinen Commit nur von der aktuellsten Version des Remotes ableiten.",
              "",
              "Es gibt verschiedene Möglichkeiten wie man das erreichen kann, aber die offensichtlichste ist es, deine Commits per Rebase zu verschieben. Schauen wir mal wie das abläuft:"
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Also wenn wir vor dem Push erst mal einen Rebase mache ..."
            ],
            "afterMarkdowns": [
              "Bämm! Wir haben unsere lokale Abbildung des entfernten Repositorys mit `git fetch` auf den neuesten Stand gebracht, unsere Arbeit auf die neueste Version des Remotes drauf gepackt und dann mit `git push` auf den Server geschoben."
            ],
            "command": "git fetch; git rebase o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Gibt es noch weitere Möglichkeiten deine Arbeit zu aktualisieren wenn das entfernte Repository neue Commits bekommen hat? Klar! Schauen wir uns dasselbe an, aber diesmal arbeiten wir mit `merge`.",
              "",
              "Obwohl `git merge` deine Arbeit nicht verschiebt (und stattdessen einen Merge Commit erzeugt) ist es eine Möglichkeit Git dazu zu bringen, alle Änderungen vom Remote in deine Sachen zu integrieren. Denn durch den Merge wird der Remote Branch zu einem *Vorgänger* deines Branches, was bedeutet dass dein Commit alle Commits des entfernten Branches beinhaltet.",
              "",
              "Zur Demonstration ..."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Wenn wir nun also mergen anstatt einen Rebase zu machen ..."
            ],
            "afterMarkdowns": [
              "Ok. Wir haben die lokale Abbildung des entfernen Repositorys mit `git fetch` aktualisiert, die neuen Änderungen per *Merge* in deine integriert, und letztere dann mit `git push` auf den Server gebracht."
            ],
            "command": "git fetch; git merge o/master; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Wahnsinn! Kann ich das auch irgendwie machen ohne soviel zu tippen?",
              "",
              "Na klar -- du kennst ja schon `git pull` als Zusammenfassung von `fetch` und `merge`. Praktischerweise bringt man es mit der Option `--rebase` dazu, anstatt des Merge einen Rebase zu machen.",
              "",
              "Gucken wir uns das mal an."
            ]
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Zunächst `git pull --rebase` ..."
            ],
            "afterMarkdowns": [
              "Genau wie vorher! Nur viel kürzer."
            ],
            "command": "git pull --rebase; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "GitDemonstrationView",
          "options": {
            "beforeMarkdowns": [
              "Und nun das normale `git pull` ..."
            ],
            "afterMarkdowns": [
              "Und wieder, genau wie zuvor!"
            ],
            "command": "git pull; git push",
            "beforeCommand": "git clone; git fakeTeamwork; git commit"
          }
        },
        {
          "type": "ModalAlert",
          "options": {
            "markdowns": [
              "Dieser Ablauf von `fetch`, `rebase` / `merge` und `push` ist sehr verbreitet. In zukünftigen Leveln werden wir uns kompliziertere Varianten dieses Workflows ansehen, aber jetzt probieren wir erst mal diesen aus.",
              "",
              "Um diesen Level zu lösen, gehe folgende Schritte durch:",
              "",
              "* Clone dein Repository",
              "* Simuliere einen entfernten Commit mit `git fakeTeamwork`",
              "* Erzeuge einen lokalen Commit",
              "* Benutze *Rebase*, um deine Arbeit schließlich pushen zu können"
            ]
          }
        }
      ]
    }
  }
};
