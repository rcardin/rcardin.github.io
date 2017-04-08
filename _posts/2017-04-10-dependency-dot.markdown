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
summary: "What is dependency in programming? Is this concept important in modern development?
          Has the concept of dependency a different meaning when we speak about procedural programming,
          object oriented programming or functional programming? In this post I will try to sum up
          all the knowledge I gain during my life as a software developer."
social-share: true
social-title: "Dependency."
social-tags: "programming, oop, softwareengineering"
---

What is _dependency_ in programming? Is this concept important in modern development?
Has the concept of dependency a different meaning when we speak about procedural programming,
object oriented programming or functional programming? In this post I will try to sum up
all the knowledge I gain during my life as a software developer.

#### The very beginning
First of all we need to have clear in mind the concept of dependency in every day language. For the
_Merriam-Webster_ the definition of dependency is the following:

> The quality or state of being influenced or determined by or subject to another.

Clarifying. Sometimes we simply have to return to our roots to deeply understand a concept. So, a
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
external developers, properly scheduled, and so on. This is one of the main reasons that stops the evolution
of an architecture.

Finally, this principle is so important because of dynamism of software architectures. There is no software
product that does not change over it lifetime. Changes happen, changes are part of software world.

#### Object oriented programming and dependency
In object oriented programming the above concept of component is usually identify with a *type*. Basically,
in object oriented programming we are interested in dependency among types, which means concrete types, a.k.a. classes,
and abstract types, a.k.a. abstract classes and interfaces.

The different kinds of dependency between types are well summarized in the following figure.

![Different kinds of dependency between types in Object Oriented Programming](http://rcardin.github.io/assets/2017-04-10/types_dependencies.png)

The figure maps all types of possible dependencies into four kind of type of relation between types.
The notation used is UML. Let's have a brief look at everyone.

**Dependency**<br/>
On the left we find the weakest form of dependency. With a dashed arrow between two types in UML we
model a dependency that

> declares that a class needs to know about another class to use objects of that class.

The following code fits exactly the above definition.

{% highlight scala %}
class A {
  def methodOfA = ...
}
class B {
  def methodWithAParameter(a: A) = ...
  def methodWithAReturn: A = ...
}
{% endhighlight %}

As you can see, the only part of `A` that `B` needs to know is the interface inferred by `A` methods. Then,
if only if `A` changes its interface, which means the signature of method `methodA`, a change in `B` would
be also required.

**Association**<br/>
Increasing the level of dependency we find *association*.

> Association means that a class will actually contain a reference to an object, or objects, of the other class
in form of an attribute.

Translating into code, we have something similar to the following.

{% highlight scala %}
class A {
  // ...
}
class B(val a: A) {
  // ...
}
{% endhighlight %}

Differently from the previous relationship we analyzed, association means that a class in *made of* references to
other classes. Their behaviour start to be more coupled, because the relationship between the types is not
temporary anymore, but it starts to be something permanent (all the lifetime of an object).

In our example, uses of references to `A` inside `B` are allowed to be used in every method of the latter, widening
the scope of possible dependencies from `A`.

**Aggregation and Composition**<br/>
Aggregation and composition are stronger versions of association, adding additional properties to the latter. Essentially,
aggregation states that one type *owns* the other, which means that it is responsible of its *creation* and *deletion*.

Composition adds the feature that if `B` is a composition of `A`, than there could be only an instance of the first owning
the an instance of the second. Instances of `A` *are not shared*.

An example of composition can be the following code.

{% highlight scala %}
class B() {
  val a: A = new A()
  // ...
  class A {
    // ...
  }
}
{% endhighlight %}

These relationships generates a stronger dependency between types, because one type has to know how to build an instance of
the other, which means the construction process.

**Inheritance**<br/>
With *inheritance* we come up to the strongest type of dependency relationship that can be defined between two different
types.

> If you find yourself saying that the class is a type of another class, then you might want to consider using
inheritance (or generalization).

From a code point of view, inheritance expresses itself as follows.

{% highlight scala %}
class A(i: int) {
  def methodOfA = ...
}
class B(i: int) extends A(i) {
  def methodOfB1 = ...
  def methodOfB2 = ...
}
{% endhighlight %}

`A` is known as *parent class*, whereas `B` is known as *child class*.

> A child class inherits and reuses all of the attributes and methods that the parent contains and that have public,
protected, or default visibility.

This is known as *implementation reuse*. The quantity of code that is shared among the two types is huge. It is even
possible that every change to `A` could result also in a change to `B`. This is the real *tight coupling*! And did you notice
that, using inheritance, *information hiding* is not respected too?

Not all the types of inheritance are bad. To inherit from abstract types mitigates the drawbacks of inheritance. Why? Lesser
the shared code is, smaller the degree of dependency is. *Type inheritance*, which means that a class implements an
interface, it is not harmful: no code, other than interface's methods, is shared between the two types.

#### Calculating the degree of dependency
You should have noticed that a pattern arose from the above descriptions. The more the code that is shared among the
two types, the stronger the dependency between them is. It is also true that, the wider the scope of this dependency is
in terms of time, the stronger the dependency is.

It will be delightful if there would exist a formula that manages to tell us the degree of coupling between two classes.
With the information just given, we can try to formalize a simple formula.

Given two classes `A` and `B`, then holds that the degree of dependency between them, ![Dependency formula](/assets/2017-04-10/dependency.png),
can be derived using the following formula.

![Dependency formula](/assets/2017-04-10/dependency_formula.png)

![Dependency formula](/assets/2017-04-10/numerator.png) is the quantity of code (i.e., SLOC) that is shared between
types `A` and `B`. ![Dependency formula](/assets/2017-04-10/denominator.png) is total number of code (i.e. SLOC) of
`B` class. Finally, ![Dependency formula](/assets/2017-04-10/epsilon_factor.png) is a factor between 0 and 1 and the
wider the scope is between `A` and `B`, the greater the factor is.

![Dependency formula](/assets/2017-04-10/dependency.png) values ranges between 0 and 1, where a value
of 0 corresponds to no dependency at all, and a value of 1 corresponds to the maximum degree of dependency.

It is easy to see that ![Dependency formula](/assets/2017-04-10/dependency.png) is near 0 in cases in which between
`A` and `B` the weakest type of dependency we saw so far holds, whereas it is near 1 when inheritance holds.

For example, if `B` inherits from `A`, than, using the definition of inheritance we gave above, the shared code
is represented by all the code of `A` that has not a `private` scope. Whereas, if a method of `B` simply refers
an instance of `A` among its parameters, the shared code will be only the signatures of `public` methods of `A`.

It is important to note that the degree of dependency between `A` and `B`, as we defined it, it is directly
proportional to the probability that if `B` is modified, also `A` should be modified accordingly.

![Dependency formula](/assets/2017-04-10/degree_proportionality.png)

Finally, using the above equation the total degree of dependency for a type `A` inside an architecture can be
calculated as *the mean* of the dependency degrees that the type has with every other single type in the architecture.

![Dependency formula](/assets/2017-04-10/total_dependency_degree.png)

#### Conclusions
Summing up, we gave a definition of dependency in software engineering. We try to understand why dependency
among components should be minimize. We revised how in object oriented design, UML helps us to visually manage
dependencies. With this information, we tried to formalize a formula that can help us to calculate the degree
of dependency between two class.

Any suggestion to improve the above formula?

#### References

 - [Merriam-Webster, Dependence definition](https://www.merriam-webster.com/dictionary/dependence)
 - [Professionalism and TDD (Reprise)](https://8thlight.com/blog/uncle-bob/2014/05/02/ProfessionalismAndTDD.html)
 - [Chapter 5: Modeling a System's Logical Structure: Advanced Class Diagrams. Learning UML 2.0, Russ Miles, Kim Hamilton, 2006,
   O'Reilly Media](http://shop.oreilly.com/product/9780596009823.do)