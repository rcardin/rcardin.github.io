---
layout: post
title:  "Object Oriented Programming strikes back!"
date:   2017-08-02 08:15:21
comments: true
categories: object-oriented functional programming
tags:
    - oop
    - fp
    - programming
summary: "Recently I read the article \"Beginning to Doubt Object-Oriented Programming\" on DZone. It is not the first post that I find on a blog that praises functional programming with respect to object-oriented programming. For all of this posts, object-oriented programming is dead (more or less). I think that at the basis of all this posts there is a misunderstanding over what functional programming really is. Now it's time for me to give my two cents to the fight among different programming paradigms."
social-share: true
social-title: "Object Oriented Programming strikes back!"
social-tags: "oop, functional, programming"
math: false
---

*Disclaimer: the post contains some humor. If you are sensible to humorism, please, do not continue to read.*

Recently I read the article [Beginning to Doubt Object-Oriented Programming](https://dzone.com/articles/beginning-to-doubt-object-oriented-programming-1) on DZone. It is not the first post that I find on a blog that praises functional programming with respect to object-oriented programming. For all of this posts, object-oriented programming is dead (more or less). I think that at the basis of all this posts there is a misunderstanding over what functional programming really is. Now it's time for me to give my two cents to the fight among different programming paradigms. 

First of all, I want to say that I respect the opinion of the author of the above article. What I am going to say it is my personal point of view on the issue. There is no an absolute right or absolute wrong opinion on this dilemma. So, peace and love to everyone.

## What is functional programming?
I think that to better understand my point of view on functional programming, it is important to first understand what I mean with this term.

> In computer science, functional programming is a programming paradigm [..] that treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data.

This is the definition given by Wikipedia. Did you read any references to _lambda expression_? Nope. So, abusing of lambda expression in your code does not mean you're using functional programming paradigm.

![Batman does not like functional bulls!](https://i.imgflip.com/1sy6bf.jpg)  

First of all, you need _referential transparency_, which means that any time a function is called with the same inputs **must** return the same output. A precondition to implement referential transparancy correctly is the _immutability_ of state. Once a structure (can we say a *type*?) is created, it cannot be subsiquently modified in any way.

Easy? Referential transparency means no _side effects_, no exceptions thrown, no reading from external sources and so on. How can we be productive without these capabilities?

### The hard part of the story
It seems that we are stuck in a black hole, doesn't it? I cannot have side effects inside a function (not that bad), I cannot signal to function callers that something could go wrong, I cannot access to any external resources. Oh Gosh!

Have you ever heard about *Monoids*, *Functors*, *Monads*? These are structures coming directly from *category theory*, a branch of Mathematics. Describing these structures are behind the scope of this post, but let's do some examples.

I know for sure that you are using at least some Monads in your code. If you are a Scala developer, probably you used `Option[T]` type, or `Either[T, E]`, or any kind of collection such as `List[T]`, `Set[T]` and so on. If you are a Java developer you can take into consideration types like `Optional<T>`, `Collection<T>` and `Stream<T>`. All of these types are Monads.

These types have nothing in common from a behavioural point of view, which means that Monads are a mechanisms to share some properties (basically, code reuse) among different types that are not directly related to each others. What does this mean? Quoting the book [Scala Design Patterns](https://www.amazon.com/Scala-Design-Patterns-Ivan-Nikolov/dp/1785882503), 

> monads are structures that represent computation as sequences of steps. Monads are useful for building pipelines, adding operations with side effects cleanly to a language where everything is immutable.

Let's borrow the definition of Monads from the excellent book [Functional Programming in Scala](https://www.manning.com/books/functional-programming-in-scala)

> A monad is an implementation of one of the minimal sets of monadic combinators (i.e. `unit` and `flatMap`), satisfying tha laws of associativity and identity.

Monadic combinators? Associativity? Identity? Unicorn? Wtf?!!? I am a simple developer: I hear about mathematics, I change programming paradigm.

![Functional programming is easy :P](https://i.imgflip.com/1sydmc.jpg)

Where do I want to go with this dissertation? The real functional programming really deals with mathematical laws and theories. If you develop your programs following these laws, you will benefit of a bunch of good properties, such as composability, testability, thread confinment, coming directly from mathematical theory. 

However you need to study and learn mathematics. Little drops of Category theory will wet your face.

## Object Oriented Programming
What about Object Oriented programming? Have you ever heard about boring mathematical laws you have to follow? Have you ever heard about esoteric terms like monads or functors, or anything else? Have you ever applied some mathematic theory to your object oriented programs?

Nope. The beautiful thing about object oriented programming is that is almost *math-free*. Everyone can start to study and learn an object oriented programming language such as Java, C++ or Kotlin. At first sight, object orientated programming is very close to **how we perceive reality**.

As human beings living in the lucky part of the world, we know that every car is made by an engine, some wheels, a body and so on. We understand what a `Car` type means and why it owns attributes of type `Engine`, `Wheel` and `Body`.

Object oriented programming is easier to learn than functional programming. Stop. This is the only truth. Both paradigms exist more or less from the beginning of Computer era (think about Lisp, for example, which is born in 1958). Have you ever heard about an operating system written in a functional programming language? Nope.

### Simplicity leads to tradeoffs 
Simpler means less constrained. Less constrained means less formality to respect. Less formality means that is simpler to use the programming language's features in an erroneous way.

Take the definition of monads that we gave just a moment ago. In the definition the constraints that a type must fulfill to be considered a monad are clear. Math does not lie.

Now, take any principle of object oriented programming: For example, the Single Responsability Principle. The principle states that

> A class should have only one reason to change.

What the f\*\*ck is a *reason to change*? Where is all the mathematical magic that principles that apply to functional programming languages have? No trace.

Neither the definition of *coupling*, which is at the base of all the theories related to object oriented programming, is defined in a formal way.

> Coupling between components measures exactly their degree of dependency.

Ok, so, how can I measure the degree of dependency between components? No formal way. I tried to give a mathematical definition of such concepts in one of my past posts, [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html), but it was only an attempt.

The lack of rigorousness in principles definitions leads to principles' interpretation. Personal interpretation often leads to errors and bad practices.

## Conclusions

Having discussed the differences between functional programming and object oriented programming paradigms we discover and understand an important concept, which is:

*The more a programming language is easy to learn, the easier it is to make mistakes using it.*

The following graph tries to show visually the meaning of this sentence.

![Programming language curve](/assets/2017-08-01/programming_languages_curve.png)

Finally, object oriented programming languages are not going anywhere. We will continue to use them, because they are easy to learn. Also functional programming languages are here to stay. Everytime we need to ensure some nice properties relative to our programs, they will help us a lot.

The world is full of tradeoff. So, stop this war among programming paradigms and start to get the best from both sides of the force.

![Yoda do it better!](https://i.imgflip.com/1tfz4g.jpg)

## References
 - [Functional programming on Wikipedia](https://en.wikipedia.org/wiki/Functional_programming)
 - [Chapter 11. Monads. Functional Programming in Scala, Paul Chiusano and Runar Bjarnason, 2014, Manning Publications](https://www.manning.com/books/functional-programming-in-scala)
 - [Monads, Chapter 1. The Design Patterns Out There and Setting Up Your Environment, Ivan Nikolov, 2016, Packt Publishing](https://www.amazon.com/Scala-Design-Patterns-Ivan-Nikolov/dp/1785882503)
 - [Chapter 8: The Single-Responsibility Principle (SRP). Agile Principles, Patterns, and Practices in C#, Robert C. Martin, Micah Martin, 2006, Prentice Hall](https://www.amazon.it/Agile-Principles-Patterns-Practices-C/dp/0131857258)
 - [Dependency.](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html)
