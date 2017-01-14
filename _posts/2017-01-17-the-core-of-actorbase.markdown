---
layout: post
title:  "The Core of Actorbase"
date:   2017-01-17 12:15:45
comments: true
categories: database scala akka actor
tags:
    - database
    - scala
    - akka
    - actor
    -
summary: "Last year I post an article regarding an idea that came to me: Actorbase. This project is relative to the development
          of a key-value database, internally based on the actor model. The article describes the reference model of Actorbase.
          Now the time has come for me to develop my own implementation of the reference model. The core of the application
          is almost done. Let's see together how this core is designed."
social-share: true
social-title: "The Core of Actorbase"
social-tags: "database, Scala, Akka, Actor"
---

Last year I post an article regarding an idea that came to me: [Actorbase](http://rcardin.github.io/database/actor-model/reactive/akka/scala/2016/02/07/actorbase-or-the-persistence-chaos.html). This project is relative to the development
of a key-value database, internally based on the actor model. The article describes the reference model of Actorbase.
Meanwhile, to different implementation were developed by independent groups of students at the University of Padua.
Now the time has come for me to develop my own implementation of the reference model. The *core* of the application
is almost done. Let's see together how this core is designed.