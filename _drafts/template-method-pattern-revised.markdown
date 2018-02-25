---
layout: post
title:  "Template Method Pattern Revised"
date:   2018-02-05 13:59:34
comments: true
categories: design programming
tags:
    - design
    - programming
summary: "When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to big haedhache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became main stream, this pattern can be revised using lambda expressions, avoiding any inheritance panic."
social-share: true
social-title: "Template Method Pattern Revised"
social-tags: "desing, Programming"
math: false
---

When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to big haedhache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became main stream, this pattern can be revised using lambda expressions, avoiding any inheritance panic.

# The original pattern
It's the year 2004. Martin Fowler had just published one of its most popular post [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) (IoC). The pattern is a concretization of the famous _Hollywood Principle_, that states

> Don't call us, we'll call you

Every Java framework in those years implements that principle: Struts, Spring MVC, Hibernate, and so on. However, the IoC was not a freshly new idea. It took its roots from a weel know design pattern of the _Gang of Four_, the *Template Method Pattern*.

The intent of the pattern is the following.

> Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.



## References
- [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
- [Inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)
- [Chapter: Template Method Pattern (page 325). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)