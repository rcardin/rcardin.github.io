---
layout: post
title:  "The Secret Life of Objects: Information Hiding"
date:   2018-06-08 12:34:33
comments: true
categories: design programming oop fp
tags:
    - design
    - programming
    - oop
summary: "I was in the world of software development for a bit now, and if I understood a single thing is that programming is not a simple affair. And, Object-Oriented programming is even less easier. The idea that I had of what an object is immediatly after I ended the University is very far from the idea I have now. Last week I came across a blog post -Goodbye, Object Oriented Programming-. After having read it, I fully understand how easily Object-Oriented programming can be misundestood at many level. I am not saying that I have the last answer to milion dollar question, but I will try to give a different perspective of my undestanding of Object-Oriented programming."
social-share: true
social-title: "The Secret Life of Objects: Information Hiding"
social-tags: "OOP, design, Programming"
math: true
---

I was in the world of software development for a bit now, and if I understood a single thing is that programming is not a simple affair. And, Object-Oriented programming is even less easier. The idea that I had of what an *object* is immediatly after I ended the University is very far from the idea I have now. Last week I came across a blog post [Goodbye, Object Oriented Programming](https://medium.com/@cscalfani/goodbye-object-oriented-programming-a59cda4c0e53). After having read it, I fully understand how easily Object-Oriented programming can be misundestood at many level. I am not saying that I have the last answer to milion dollar question, but I will try to give a different perspective of my undestanding of Object-Oriented programming.

## Introduction 

Probably, this will be the harder post I have ever written by now. It is not a simple affair to reason to the basis of Object-Ortiented programming. I think that the first thing we should do is to define _what an object is_.

Once, I have tried to give a definition to _objects_:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">The aim of Object-oriented <a href="https://twitter.com/hashtag/programming?src=hash&amp;ref_src=twsrc%5Etfw">#programming</a> is not modeling reality using abstract representations of its component, accidentally called &quot;objects&quot;. <a href="https://twitter.com/hashtag/OOP?src=hash&amp;ref_src=twsrc%5Etfw">#OOP</a> aims to organize behaviors and data together in structures, minimizing dependencies among them.</p>&mdash; Riccardo Cardin (@riccardo_cardin) <a href="https://twitter.com/riccardo_cardin/status/992138929800450048?ref_src=twsrc%5Etfw">May 3, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

There is a lot of information in the above definition. Let's divide it and take a piece at time.

## Messages are the core

At the beginning there was procedural programming. Exponents of such programming paradigm are languages like COBOL, C, PASCAL, and more recently, Go. In procedual programming, the building block is represented by _the procedure_, which is a function (not mathematically speaking) that take some input arguments and could return some output values.

Data can have some primitive form, like `int` or `double`, or it can be structured into _records_. A record is a set of correlated data, like a `Rectangle`, which contains two primitive `height` and `length` of type `double`. Using C-like notation, a vector is defined as

{% highlight c %}
struct Rectangle {
   double   height;
   double   length;
};
{% endhighlight %}

Despite of inputs and outputs, there is no directly connection between data (records) and behaviors (procedures). So. if we want to model all the operation available on a `Rectangle`, we have to create a lot of procedures that take it as an input.

{% highlight c %}
double area(Rectangle r)
{
    // Code that computes the area of a rectangle 
}
void scale(Rectangle r, double factor)
{
    // Code that change the rectangle r, mutating directly its components
}
{% endhighlight %}

As you can see, every procedure insists on the same type of structure, the `Rectangle`. Every procedure needs in input an instance of the structure on which executes. Moreover, every piece of code that owns an instance of the `Rectangle` structure *can access its member values without control*. There is no concept of restriction on which operation can be done on the internal information of a structure.

This makes the procedures' definition very verbose and their maintanance very tricky. Tests becomes very hard to design and execute, because of the lack of _information hiding_.

The main goal of Object-Oriented programming was that of binding the behavior (a.k.a. methods) with the data on which they operate (a.k.a., attributes). As Alan Kay once said:

> [..] it is not even about classes. I'm sorry that I long ago coined the term "objects" for this topic because it gets many people to focus on the lesser idea. The big idea is "messaging" [..]

The concept of class allows us to regain the focus on behavior, and not on methods inputs. You should not even know the internal represetation of a class. You only need its _interface_. In Object-Oriented progamming, the above example becomes the following (I choose to use Scala because of its lack of cerimony).

{% highlight scala %}
trait Shape {
  def area: Double
  def scale(factor: Double): Shape
}
case class Rectangle(height: Double, length: Double) extends Shape {
  // Definition of functions declared abstract in Shape trait
}
{% endhighlight %}

The given example is very trivial. Starting from element `height`, `length` and procedures `scale` and `area`, it was very straight to derive an elegant Object-Oriented solution. But, is it possible to formalize (and, maybe automize) the process we just did to define the class `Rectangle`? Let's try to answer this question.

## Information hiding and class definition

We can begin from a totally unstructured set of procedures.

{% highlight scala %}
def scale(height: Double, length: Double, factor: Double): (Double, Double) = {
  (height \* factor, length \* factor)
}
def norm(height: Double, length: Double): Double = {
  height * length
}
{% endhighlight %}

First of all, we notice that `height` and `length` parameters are present in both procedures. We might create a type for each parameter, like `Height` and `Length`. However, we immediately understand that the two parameters will be always used together in our use cases. There are not procedures that uses only one of the two.

So, we decide to create a structure to bind them together, `Rectangle`. 

{% highlight scala %}
type Rectangle = (Double, Double)
{% endhighlight %}

We also understand that a simple structure does not fit our needs. `Rectangle` internal should be changed by anything else then the two procedures (forget for a moment that tuples are immutable in Scala). Telling the truth, we are really interested only in the two procedures. So, we restrict the access to vector information only to the procedure.

How can we do that? We should bind information of a rectangle with the behaviors associated to it. We need a class.

{% highlight scala %}
case class Rectangle(height: Double, length: Double) {
  def scale(factor: Double): Rectangle = Rectangle(height * factor, length)
  val area: Double = height * length
}
{% endhighlight %}

Well, taking into consideration only the use cases we have, we could stop here. The solution is already optimal. We hid the information of axis behind our class; the behavior is the only thing client can access from the outside; clients that want to use a vector can interact only with class `Vector`.

What if we want to support also shapes like squares and circles?? Well, through the use of _intefaces_, types that are pure behavior, object-oriented programming allows our clients to abstract from the concrete implementation of a shape. Then, the above example becomes the following.

{% highlight scala %}
trait Shape {
  def scale(factor: Double): Shape
  def area: Double
}
case class Rectangle(height: Double, length: Double) extends Shape {
  // Definition of functions declared abstract in Shape trait
}
case class Square(length: Double) extends Shape {
  // Definition of functions declared abstract in Shape trait
}
case class Circle(ray: Double) extends Shape {
  // Definition of functions declared abstract in Shape trait
}
{% endhighlight %}

As Wikipedia reminds us

> Information hiding is the principle of segregation of the design decisions in a computer program that are most likely to change, thus protecting other parts of the program from extensive modification if the design decision is changed. The protection involves providing a stable interface which protects the remainder of the program from the implementation (the details that are most likely to change).

### Relationship between information hiding and dependency degree

As anyone who follows me from some time knows, I am a big fan of dependency minimization between classes. I have developed a little [theoretical framework](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html) that allows to calculate the dependency degree of an architecture. Basically, this framework is based on the number of dependencies a class has with other classes and the scope of these dependencies, in terms of class life cycle.

I have already use my framework in other circumstances, like when I spoke about the [Single-Responsibility Principle](http://rcardin.github.io/solid/srp/programming/2017/12/31/srp-done-right.html).

This time I will try to use it to sketch the process we just analyzed, whose goal is to aggregate information and related behaviors inside the same class, _hiding_ the former to the clients of the class. Basically, I will try to answer to the question _Why do height and length be collapsed inside one single type (which is incidentally called `Rectangle`)

Just as a recap, I defined in the post [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html) the degree of dependency between two classes `A` and `B` as

$$
  \large{\delta_{A \to B} = \frac{\varphi_{S_{A|B}}}{\varphi_{S_{tot_B}}}\varepsilon_{A \to B}}
$$

\\(\varphi\_{S\_{A|B}}\\) is the quantity of code (i.e., SLOC) that is shared between
types `A` and `B`. \\(\varphi\_{S\_{tot_B}}\\) is the total number of code (i.e. SLOC) of
`B` class. Finally, \\(\varepsilon_{A \to B}\\) is a factor between 0 and 1 and the wider
the scope between `A` and `B`, the greater the factor.

If `Height` and `Lenght` had been defined as dedicated types each, then a client `C` that needed to use a rectangle would always have to use both types. Moreover, the `Rectangle` type would still have been necessary, to put the methods `area` and `scale`. Using this configuration, `Rectangle`, `Height` and `Length` are said to be _tightly coupled_, because they are always use together. 

The degree of dependency of class `C` would be very high, using the above definition. Also the degree of dependency of class `Rectangle` would be high, due to reference to `Height` and `Lenght` in the methods `area` and `scale`.

Probably, there are many class configurations that can reduce the above degrees of dependency. However, the minimization of the value \\(\delta_{tot}^{C}\\) can be reached by the solution we gave in the previous paragraph. 

So, in some way, we have reduced the _art_ of design an architecture, to finding a design that minimize a mathematical functino on degree of dependency. Nice.

## Conclusion

Just to sum up, using a toy example (I admit) we tried to sketch the informal process that should be use to defined types and classes. We started from the lacks in procedural programming paradigm and we endend trying to give a mathematical formulation of the above process. All the indexes we used are tightly related to the basic concept of _information hiding_.

Clearly, this is just an idea. It was not my intention to belittle procedural programming, not to celebrate object-oriented programming.

## References

- [Goodbye, Object Oriented Programming](https://medium.com/@cscalfani/goodbye-object-oriented-programming-a59cda4c0e53)
- [Procedural programming](https://en.wikipedia.org/wiki/Procedural_programming)
- [Alan Kay On Messaging](http://wiki.c2.com/?AlanKayOnMessaging)
- [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html)
- [Single-Responsibility Principle done right](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html)