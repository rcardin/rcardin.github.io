---
layout: post
title:  "Single-Responsibility Principle done right"
date:   2017-12-31 13:59:34
comments: true
categories: solid srp programming 
tags:
    - solid
    - srp
    - programming
summary: "I am a big fan of SOLID programming principles by Robert C. Martin. In particular, I thought that the Single-Responsibility Principle was one of the most powerful among these principles, yet one of the most misleading. Its definition does not give any rigorous detail on how to apply it. Every developer has left to his own experiences and knowledge to define what a responsibility is. Well, maybe I found a way to standardize the application of this principle during the development process. Let me explain how."
social-share: true
social-title: "Single Responsibility Principle done right"
social-tags: "srp, solid, Programming"
reddit-link: "https://www.reddit.com/r/programming/comments/7nup0s/singleresponsibility_principle_done_right/"
dzone-link: "https://dzone.com/articles/single-responsibility-principle-done-right"
math: true
---

I am a big fan of SOLID programming principles by Robert C. Martin. In my opinion, Uncle Bob did a great work when it first defined them in its books. In particular, I thought that the Single-Responsibility Principle was one of the most powerful among these principles, yet one of the most misleading. Its definition does not give any rigorous detail on how to apply it. Every developer has left to his own experiences and knowledge to define what a responsibility is. Well, maybe I found a way to standardize the application of this principle during the development process. Let me explain how.

## The Single-Responsibility Principle
As it is used to do for all the big stories, I think it is better to start from the beginning. In 2006, Robert C. Marting, a.k.a. Uncle Bob, collected inside the book [Agile Principles, Patterns, And Practices in C#](https://www.amazon.it/Agile-Principles-Patterns-Practices-C/dp/0131857258) a series of articles that represent the basis of clean programming, through the principles also known as SOLID. Each letter of the word SOLID refers to a programming principle:

 - **S** stands for Single-Responsibility Principle
 - **O** stands for Open-Closed Principle
 - **L** stands for Liskov Substitution Principle
 - **I** stands for Interface Segregation Principle
 - **D** stands for Dependency Inversion Principle

Despite the resonant names and the clearly marketing intent behind them, in the above principles are described some interesting best practices of object-oriented programming.

The Single-Responsibility principle is one of the most famous of the five. Robert uses a very attractive sentence to define it:

> A class should have only one reason to change.

Boom. Concise, attractive, but so ambiguous. To explain the principle, the author uses an example that is summarized in the following class diagram.

![Violation of SRP](/assets/2017-12-26/srp_wrong_design.png)

In the above example, the class `Rectangle` is said to have at least _two responsibilies_: drawing a rectangle on a GUI and calculate the area of such rectangle. Is it really bad? Well, yes. For example, this design forces the `ComputationalGeometryApp` class to have a dependency on the class `GUI`. 

Moreover, having more than one responsibility means that, every time a change to a requirement linked to the user interface comes, there is a non zero probability that the class `ComputationalGeometryApp` could be changed too. This is also the link between _responsibilities_ and _reasons to change_.

The design that completely adheres to the Single-Responsibility Principle is the following.

![Design SRP-proof](/assets/2017-12-26/srp_design.png)

Arranging the dependencies among classes as depicted in the above class diagram, the geometrical application does not depend on user interface stuff anymore.

## The dark side of the Single-Responsibility Principle
Well, probably it is one of my problems, but I ever thought that a principle should be defined in a way that two different people understand it in the same way. There should be no space left for interpretation. A principle should be defined using a _quantitave approach_, rather than a _qualitative approach_. Probably, my fault comes from my mathematical extraction.

Given the above definition of the Single-Responsibility Principle, it is clear that there is no mathematical rigor to it.

Every developer, using its own experience can give a different meaning to the word _responsibility_. The most common misunderstanding regarding responsibilities is which is the right grain to achieve.

Recently, a "famous" blogger in the field of programming, called Yegor Bugayenko, published a post on his blog in which he discusses how the Single-Responsibility Principle is a hoax: [SRP is a Hoax](http://www.yegor256.com/2017/12/19/srp-is-hoax.html). In the post, he gave a wrong interpretation of the conception of responsibility, in my opinion.

He started from a simple type, which aim is to manage objects stored in AWS S3.

{% highlight java %}
class AwsOcket {
    boolean exists() { /* ... */ }
    void read(final OutputStream output) { /* ... */ }
    void write(final InputStream input) { /* ... */ }
}
{% endhighlight %}

In his opinion, the above class has more than one responsibility:

1. Checking the existence of an object in AWS S3
2. Reading its content
3. Modifying its content

Uhm. So, he proposes to split the class into three different new types, `ExistenceChecker`, `ContentReader`, and `ContentWriter`. With this new type, in order to read the content and print it to the console, the following code is needed.

{% highlight java %}
if (new ExistenceChecker(ocket.aws()).exists()) {
  new ContentReader(ocket.aws()).read(System.out);
}
{% endhighlight %}

As you can see, Yegor experience drives him to defined too fine-grained responsibilities, leading to three types that clearly are not properly **cohesive**.

Where is the problem with Yegor interpretation? Which is the keystone to the comprehension of the Single-Responsibility Principle? _Cohesion_.

## It's all about Cohesion
Telling the truth, Uncle Bob opens the chapter dedicated to the Single-Responsibility Principle with the following two sentences.

> This principle was described in the work of Tom DeMarco and Meilir Page-Jones. They called it cohesion. They defined cohesion as the functional relatedness of the elements of a module.

Wikipedia defines cohesion as

>  the degree to which the elements inside a module belong together. In one sense, it is a measure of the strength of relationship between the methods and data of a class and some unifying purpose or concept served by that class.

So, which is the relationship between the Single-Responsibility Principle and cohesion? Cohesion gives us a formal rule to apply when we are in doubt if a type owns more than one responsibility. If a client of a type tends to use always all the functions of that type, then the type is probably highly cohesive. This means that it owns only one responsibility, and hence only one reason for changing.

It turns out that, like the Open-Closed Principle, you cannot say if a class fulfills the Single-Responsibility Principle in isolation. You need to look at its _incoming dependencies_. In other words, _the clients of a class define if it fullfils or not the principle_.

Shocking.

Looking back at Yegor example, it is clear that the three classes he created, thinking of adhering to the Single-Responsibility Principle in this way, are loosely cohesive and hence tightly coupled. The classes `ExistenceChecker`, `ContentReader`, and `ContentWriter` will probably always be used together.

### Pushing to the limit: Effects on the degree of dependency
In the post [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html), I defined a mathematical framework to derive a _degree of dependency_ between types. The natural question that arises is: applying the above reasoning, does the degree of dependency of the overall architecture decrease or increase? 

Well, first of all, let's recall how we can obtain the total degree of dependency of a type `A`.

$$
  \delta_{tot}^{A} = \frac{1}{n} \displaystyle\sum_{C_j \in {C_1, \dots, C_n}} \delta_{A \to C_j }
$$

In our case, type `A` is the client of the class `AwsOcket`. Recalling that the value of \\(\delta_{A \to C_j }\\) ranges between 0 and 1, dividing without any motivation the class `AwsOcket` into three different types will not increase the overall degree of dependency of client `A`. In fact, the normalizing factor \\(\frac{1}{n}\\) assure us that refactoring processes will not increase the local degree of dependency.

The overall degree of the entire architecture will instead increase since we have three new types that still depend on `AwsOcket`.

Does this mean that the view of the Single-Responsibility Principle I gave during the post is wrong? No, it does not. However, it shows us that the mathematical framework is incomplete. Probably, the formula for the degree of dependency should be recursive, in order to take into consideration the addition of new tightly coupled types.

## Conclusions
Starting from the definition given by Robert C. Martin of the Single-Responsibility Principle, we showed how simple is to misunderstand it. In order to give some more formal definition, we showed how the principle can be viewed in terms of the concept of cohesion. Finally, we try to give a mathematical proof of what we have done, but we went to the conclusion that the framework that we were using is incomplete. 

This post concludes the year 2017. I want to thank all the people that took some of their time to read my post during this year. I will certainly return in 2018. Stay tuned.

Happy new year.

## References
- [Chapter 8: The Single-Responsibility Principle (SRP). Agile Principles, Patterns, And Practices in C#,	Robert C. Martin, Micah Martin, March 2006, Prentice Hall](https://www.amazon.it/Agile-Principles-Patterns-Practices-C/dp/0131857258)
- [SRP is a Hoax](http://www.yegor256.com/2017/12/19/srp-is-hoax.html)
- [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html)
