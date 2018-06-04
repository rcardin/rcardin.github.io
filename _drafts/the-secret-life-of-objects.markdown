---
layout: post
title:  "The Secret Life of Objects"
date:   2018-06-08 12:34:33
comments: true
categories: design programming oop fp
tags:
    - design
    - programming
    - oop
summary: "I was in the world of software development for a bit now, and if I understood a single thing is that programming is not a simple affair. And, Object-Oriented programming is even less easier. The idea that I had of what an object is immediatly after I ended the University is very far from the idea I have now. Last week I came across a blog post -Goodbye, Object Oriented Programming-. After having read it, I fully understand how easily Object-Oriented programming can be misundestood at many level. I am not saying that I have the last answer to milion dollar question, but I will try to give a different perspective of my undestanding of Object-Oriented programming."
social-share: true
social-title: "The Secret Life of Objects"
social-tags: "OOP, design, Programming"
math: false
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

Data can have some primitive form, like `int` or `double`, or it can be structured into _records_. A record is a set of correlated data, like a `Vector`, which contains two primitive `x` and `y` of type `double`. Using C-like notation, a vector is defined as

{% highlight c %}
struct Vectors {
   double   x;
   double   y;
};
{% endhighlight %}

Despite of inputs and outputs, there is no directly connection between data (records) and behaviors (procedures). So. if we want to model all the operation available on a `Vector`, we have to create a lot of procedures that take it as an input.

{% highlight c %}
double norm(Vectors v)
{
    // Code that computes the norm 
}
void scale(Vectors v, double factor)
{
    // Code that change the vector v, mutating directly its components
}
{% endhighlight %}

As you can see, every procedure insists on the same type of structure, the `Vectors`. Every procedure needs in input an instance of the structure on which executes. Moreover, every piece of code that owns an instance of the `Vectors` structure can access its member values without control. There is no concept of restriction on change of the information of a structure. 

This makes the procedures' definition very verbose and their maintanance very tricky.

The main goal of Object-Oriented programing was that of binding the behavours (methods) with the data on which they operate. As Alan Kay once said:

> [..] it is not even about classes. I'm sorry that I long ago coined the term "objects" for this topic because it gets many people to focus on the lesser idea. The big idea is "messaging" [..]

## References
- [Procedural programming](https://en.wikipedia.org/wiki/Procedural_programming)
- [Alan Kay On Messaging](http://wiki.c2.com/?AlanKayOnMessaging)