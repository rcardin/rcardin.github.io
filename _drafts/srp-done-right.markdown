---
layout: post
title:  "Single-Responsibility Principle done right"
date:   2017-12-30 16:01:34
comments: true
categories: solid srp programming 
tags:
    - solid
    - srp
    - programming
summary: "I am a big fan of SOLID programming principles by Robert C. Martin. In particular, I thought that the Single-Responsibility Principle was one of the most powerful among these principles, yet one of the most misleading. Its definition gives not any rigorous detail on how to apply it. Every developer is left to his own experiences an knowledge to defined what a responsibility is. Well, maybe I found a way to standardize the application of this principle during the development process. Let me explain how."
social-share: true
social-title: "Single Responsibility Principle done right"
social-tags: "srp, solid, Programming"
math: false
---

I am a big fan of SOLID programming principles by Robert C. Martin. In my opinion, Uncle Bob did a great work when it first defined them in its books. In particular, I thought that the Single-Responsibility Principle was one of the most powerful among these principles, yet one of the most misleading. Its definition gives not any rigorous detail on how to apply it. Every developer is left to his own experiences an knowledge to defined what a responsibility is. Well, maybe I found a way to standardize the application of this principle during the development process. Let me explain how.

## The Single Responsibility Principle
As it is used to do for all the big stories, I think it is better to start from the beginning. In 2006, Robert C. Marting, a.k.a. Uncle Bob, collected inside the book [Agile Principles, Patterns, And Practices in C#](https://www.amazon.it/Agile-Principles-Patterns-Practices-C/dp/0131857258) a series of articles that represent the basis of clean programming, through the principles also known as SOLID. Each letter of the word SOLID refers to a programming principle:

 - **S** stands for Single-Responsibility Principle
 - **O** stands for Open-Closed Principle
 - **L** stands for Liskov Substitution Principle
 - **I** stands for Interface Segregation Principle
 - **D** stands for Dependency Inversion Principle

Despite of the resonant names and the clearly marketing intent behind them, in the above principles are described some interesting best practices of object-oriented programming.

The Single-Responsibility principle is one of the most famous of the five. Robert uses a very attractive sentence to define it:

> A class should have only one reason to change.

Boom. Concise, attractive, but so ambiguous. To explain the principle, the author uses an example that is summarize in the following class diagram.

![Violation of SRP](/assets/2017-12-26/srp_wrong_design.png)

In the above example the class `Rectangle` is said to have at least _two responsibilies_: drawing a rectangle on a GUI and calculate the area of such rectangle. Is it really bad? Well, yes. For example, this design forces the `ComputationalGeometryApp` class to have a dependency from the class `GUI`. 

Moreover, having more than one responsibility means that, every time a change to a requirement linked to the user interface comes, there is a non zero probability that the class `ComputationalGeometryApp` could be changed too. This is also the link between _responsibilities_ and _reasons to change_.

The design that completely adheres to the Single-Responsibility Principle is the following.

![Design SRP-proof](/assets/2017-12-26/srp_design.png)

Arranging the dependencies among classes as depicted in the above class diagram, the geometrical application does not depend from user interface stuff anymore.

## The dark side of the Single-Responsibility Principle
Well, probably it is one of my problems, but I ever thought that a principle should be defined in a way that two different people understand it in the same way. There should be not space left for interpretation. Probably, my defect comes from my mathematical extraction.

Given the above definition of the Single-Responibility Principle, it is clear that there is no mathematical rigours in it.


## References
- [Chapter 8: The Single-Responsibility Principle (SRP). Agile Principles, Patterns, And Practices in C#,	Robert C. Martin, Micah Martin, March 2006, Prentice Hall](https://www.amazon.it/Agile-Principles-Patterns-Practices-C/dp/0131857258)
- [SRP is a Hoax](http://www.yegor256.com/2017/12/19/srp-is-hoax.html)