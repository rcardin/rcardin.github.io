---
layout: post
title:  "Dependency."
date:   2017-04-10 08:43:54
comments: true
categories: programming oop software-engineering
tags:
    - programming
    - oop
    - software-engineering
summary: "What is dependency in programming? Is this concept so important in modern development?
          Has the concept of dependency a different meaning when we speak about procedural programming,
          object oriented programming or functional programming? In this post I will try so sum up
          all the knowledge I have gain during my life as a software developer."
social-share: true
social-title: "Dependency."
social-tags: "programming, oop, softwareengineering"
---

What is _dependency_ in programming? Is this concept so important in modern development?
Has the concept of dependency a different meaning when we speak about procedural programming,
object oriented programming or functional programming? In this post I will try so sum up
all the knowledge I have gain during my life as a software developer.

#### The very beginning
First of all we need to have clear in mind the concept of dependency in every day language. For the
_Merriam-Webster_ the definition of dependency is the following:

> The quality or state of being influenced or determined by or subject to another.

Clarifying. Sometimes we simply have to return to our root to deeply understand a concept. So a
component that is dependent by another is influenced by this one. What does this means? If a component
changes internally (its implementation) or externally (its interface), it is probable that all dependent
components should change accordingly too.

We have just derive that the _dependency between two components is a measure of the probability that
changes to one of component should affect also the other_. The stronger the dependency between the
components, the higher the above probability.

**Coupling**<br/>
Coupling between components measures exactly their degree of dependency. Tightly coupled components have
a high probability to change together; loose coupled components have a low probability that this fact
happens.

In software engineering we have a *mantra*, that was taught us from the very beginning:

> Dependency between components must be minimized, making components loose coupled.

Why is this principle so important? The main concept that is behind the above sentence is that we should
be free to change a component to resolve a bug, or to add a new feature, or to do whatever we want, without
having to worry about changes to other components of the architecture.

Why changing a component is considered so dangerous, that we have to do only if it is strictly necessary?
Every time we change a component, there is the risk we are introducing a bug. Then, to avoid regressions, we
need to re-execute all tests associated to the changed components (what if we have not automated test?
Ask [Robert C. Martin](https://8thlight.com/blog/uncle-bob/2014/05/02/ProfessionalismAndTDD.html)...)

Moreover, we should not own directly the dependent components. In such cases, changes must be discussed with
external developers, properly scheduled, and so on. This is one of the main reasons that stop the evolution
of an architecture.

Finally, this principle is so important because of dynamism of software architectures. There is no software
product that does not change over it lifetime. Then, changes happen, changes are part of software world.

#### Object oriented programming and dependency
In object oriented programming the above components are usually identify with *types*. Basically, in this
type of programming we are interested to dependency among types, which means concrete types, a.k.a. classes,
and abstract types, a.k.a. abstract classes and interfaces.

Different kinds of dependency between types are well summarized in the following figure.

![Different kinds of dependenct between types in Object Oriented Programming](http://rcardin.github.io/assets/2017-04-10/types_dependencies.png)

The figure maps all types of possible dependencies into four kind of type of relation between types.
The notation used is clearly UML. Let's have a brief look to everyone.

**Dependency**<br/>
On the left we find the weakest form of dependency. With a dashed arrow between two types in UML we
model a dependency that

> declares that a class needs to know about another class to use objects of that class.

The following use cases fit exactly the above definition.

{% highlight scala %}
class A {
  def methodOfA = ...
}
class B {
  def methodWithAParameter(a: A) = ...
  def methodWithAReturn: A = ...
  def methodThatCreatesAnA: A = new A()
}
{% endhighlight %}

As you can see, the only part of `A` that `B` needs to know is the interface inferred by `A` methods. Then,
if only if `A` changes its interface, which means its constructor or the signature of method `methodA`, a
change in `B` will be also required.

#### Conclusions
Summing up, we gave a definition of dependency in software engineering. We try to understand why dependency
among components should be minimize. We revised how in object oriented design, UML helps us to visually manage
dependencies.

#### References

 - [Merriam-Webster, Dependence definition](https://www.merriam-webster.com/dictionary/dependence)
 - [Professionalism and TDD (Reprise)](https://8thlight.com/blog/uncle-bob/2014/05/02/ProfessionalismAndTDD.html)
 - [Chapter 5: Modeling a System's Logical Structure: Advanced Class Diagrams. Learning UML 2.0, Russ Miles, Kim Hamilton, 2006,
   O'Reilly Media](http://shop.oreilly.com/product/9780596009823.do)