---
layout: post
title:  "...And Monads for (Almost) All: The Reader Monad"
date:   2020-02-25 21:09:53
comments: true
categories: design programming fp monad
tags:
    - design
    - programming
    - fp
summary: ""
social-share: true
social-title: "...And Monads for (Almost) All: The Reader Monad"
social-tags: "FP, design, Programming, monad, Scala, Kotlin"
math: false
---

Who follows me from the beginning perfectly knows my obsession for the dependency management in programming languages. We have already written of dependency injection mechanisms in modern programming languages. In [Eat that cake!](http://rcardin.github.io/design/2014/08/28/eat-that-cake.html) I wrote about the Cake Pattern and how to use Scala self types to resolve the problem of dependency injection. In [Resolving your problems with Dependency Injection](http://rcardin.github.io/programming/software-design/java/scala/di/2016/08/01/resolve-problems-dependency-injection.html) I introduced the problem of the dependency resolution. In [Resolve me, Implicitly](http://rcardin.github.io/design/scala/2017/10/15/resolve-me-implicitly.html) I showed how to use Scala `implicit`s to implement a dependency injection mechanism. Now its time to speak about how functional programming tries to solve the depenency management issue, using the *Reader Monad*.