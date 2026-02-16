---
layout: post
title:  "A (too) short introduction to Scala"
date:   2015-05-21 07:45:00
comments: true
categories: programming scala
tags:
    - scala
    - design
    - presentation
summary: "I recently had an introductory talk on the Scala programming language. the aim of the talk was not to be a
comprehensive presentation of the Scala programming language. The aim was to introduce the Scala language, putting a
stress on the features that made it one of the heirs to the throne of programming."
social-share: true
social-title: "A (too) short introduction to Scala"
social-tags: "scala, programming"
---
I recently had an introductory talk on the Scala programming language. The audience of the seminar was mainly
composed of students of the bachelor-level informatics curriculum at the University of Padova. These students had just
learned to program in Java, to use UML notation and design patterns. So I thought: "*Why don't I propose to my
students something alternative to Java. A language that interiorizes the best practices of programming of the last
fifteen years. So, Why don't I have a talk about Scala?*"

And this is the story about how this introductory talk about Scala was born.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/jGPt8AhLCfoltd" width="425" height="355" frameborder="0" 
        marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> 
</iframe> 
<div style="margin-bottom:5px"> 
    <strong> <a href="//www.slideshare.net/RiccardoCardin/a-too-short-introduction-to-scala" 
                title="A (too) Short Introduction to Scala" target="_blank">A (too) Short Introduction to Scala
             </a> 
    </strong> from 
    <strong><a href="//www.slideshare.net/RiccardoCardin" target="_blank">Riccardo Cardin</a></strong> 
</div>

So, the aim of the talk was not to be a comprehensive presentation of the Scala programming language. The aim was to introduce
the Scala language, putting a stress on the features that made it one of the heirs to the throne of programming.

In particular, the following concepts in the talks are presented:

* A brief history of the language
* Main syntax features
* Object oriented Scala (Classes, Objects, Abstract classes and Traits, Case classes and pattern matching, Generics,
  Implicits, `Option[A]`, `Tuple`)
* Functional Scala (First class functions, Lambdas, Recursion, Currying, Call by name/value)

Using these concepts, I showed to my students how the language allows to implement natively some design pattern, such as:

* Singleton
* Factory method
* Null object
* Decorator (using *mixin*s)
* Abstract factory
* Value object
* Adapter
* Strategy
* Command
* Template method

Let's say that if you have a OO background and if you want to start to learn the Scala language, this talk could be a
good starting point. But, if you want to go a little deeper, I suggest you this book:

*[Scala for the impatient](http://www.horstmann.com/scala/index.html)*, Cay Horstmann, Addison-Wesley 2012