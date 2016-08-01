---
layout: post
title:  "Resolving your problems with Dependency Injection"
date:   2016-08-01 08:00:00
comments: true
categories: programming software-design java scala di
tags:
    - design
    - java
    - scala
    - programming
summary: "'No Silver Bullet' wrote Brooks in the far away 1986. The history of software engineering proved him right, 
          there is no doubt. Through the past years, hundreds of theories, patterns, frameworks, technologies risen as 
          fast as they successively fallen. Dependency injection broke down the developer community from its definition.
          In this post I will introduce the pattern, giving the basis for developing a discussion on pattern 
          pros and cons in the next post of this series."
social-share: true
social-title: "In defence of Dependency Injection"
social-tags: "programming, DI, java, scala"
---

> No Silver Bullet

wrote Brooks in the far away 1986. The history of software engineering proved him right, there is no doubt. 
Through the past years, hundreds of theories, patterns, frameworks, technologies risen as fast as they successively 
fallen. Many design patterns written by the *Gang of four* have not any application in modern age of computer science. 
Take as an example, the [Singleton](http://rcardin.github.io/design/programming/2015/07/03/the-good-the-bad-and-the-singleton.html) 
pattern. 

Focus on design patterns, there is one that from its definition broke down the developer community, the **dependency 
injection**. In this post I will introduce the pattern, giving the basis for developing a discussion on pattern 
pros and cons in the next post of this series.

So, let's start from the beginning: dependency injection definition.

#### Definition

The definition of *dependency injection* was first given by Martin Fowler in the blog post [Inversion of Control 
Containers and the Dependency Injection pattern](http://martinfowler.com/articles/injection.html). The dependency 
injection is an *Enterprise pattern*, which aim is to  

> separate the responsibility of resolving object dependency from its behaviour.

First of all, what is a dependency between two classes? Take a look to the following class diagram:

![Two tightly-coupled classes](http://rcardin.github.io/assets/2016-06-09/di_1.png)

The class `MovieLister` has an attribute, `finder`, of type `MovieFinder`. So, we used to say that the class 
`MovieLister` has a dependency from the class `MovieFinder`. Between two classes there could be a lot of different types
of dependency, some stronger than others, but here we are going to focus on *property* dependencies.

Clearly, letting a class to explicitly create an instance of another class tightly coupled the two *implementations*, 
increasing the dependency between them. 

{% highlight java %}
public class MovieLister {
    private MovieFinder finder;
    public MovieLister() {
        // This statement tightly coupled the two classes because the class has a direct reference
        // to a particular implementation of MovieFinder interface
        this.finder = new MovieFinderImpl();
    }
    // ...
}
{% endhighlight %}

Defining the dependency between two classes as an function directly proportional to the probability of correlate changes 
in the classes, we immediately understand that dependency should be **minimize**.
  
A first attempt to solve this problem is to use a *factory* class that creates instances of `MovieFinder`. In this way, 
`MovieLister` minimize the dependency from `MovieFinder`, referring only to the defined interface.
  
![Trying to solve the problem using a factory](http://rcardin.github.io/assets/2016-06-09/di_2.png)

But again, we have a problem: now `MovieLister` has a dependency with the implementation of `MovieFinderFactory` (and, 
most important, we decided to implement the factory as a Singleton...WTF!). Moreover, we certainly have more than a 
single dependency in a class, which leads to a plethora of factories rising. And dependencies can have dependencies, and
so on.

Clearly, the path is traced, but we have to take a step over to get the optimal solution. Here it comes the idea of 
Martin Fowler. Why don't we take the factory idea to the limit and we create a module that is responsible to resolve 
dependency among classes? 

![Resolving dependencies using a dependency injector](http://rcardin.github.io/assets/2016-06-09/di_3.png) 
 
This module is called *dependency injector* and it is to all effects a container. Applying the *Inversion of Control* 
pattern, typical of all modern frameworks, it owns the life cycle of all objects defined under its scope. As a *deus ex
machina* of object's life, he is able to resolve the dependency Directly Acyclic Graph (DAG) identified among these objects.
  
Well, this is the right way. The only things we still miss are the following:

 1. A way to signal to the injector that a class has a certain dependency
 2. A way to instruct (or configure) the injector to resolve dependencies
 
#### Constructor injection versus Setter injection
Since dependencies are nothing more then objects attributes (more or less), the injector has to be instructed to know how 
to fulfill these attributes. In Java there are three ways to set attributes of an object, which are:
   
 1. Using the proper constructor
 2. Using setters after the object was build using the default constructor
 3. Using Reflection mechanisms

Once you have selected your preferred way, you will annotate the corresponding statement with the `@Inject` annotation.
The annotation and its behaviour are defined inside a JSR. Dependency injection is so important in the Java ecosystem 
that there are two dedicated JSRs, i.e. [JSR-330](https://jcp.org/en/jsr/detail?id=330) and [JSR-299](https://jcp.org/en/jsr/detail?id=299). 

**Constructor dependency injection**<br /> 
If you want the injector to use the constructor to inject the dependency of a class, annotate the constructor with 
`@Inject`.
  
{% highlight java %}
public class MovieLister {
    private MovieFinder finder;
   
    @Inject
    public MovieLister(MovieFinder finder) {
        this.finder = finder;
    }
    // ...
}
{% endhighlight %}  

Every time you will ask the injector an instance of a `MovieLister`, it will know that it has to use the constructor 
annotated with the `@Inject` annotation to build the object. So, the dependency are identified as the annotated 
constructor parameters.


This is the **preferred** and **correct** way to use the dependency injection. Because the object is build using a 
constructor, this behaviour favors the use of *immutable* objects and do not break the *information hiding* principle.

**Setter dependency injection**<br />
Since the definition of the Java programming language, the aim of the Sun Microsystem was standardization. The
[Java Bean Specification](http://download.oracle.com/otndocs/jcp/7224-javabeans-1.01-fr-spec-oth-JSpec/) stated that a
java bean must have a default constructor and a couple of getter and setter methods for each attribute it owns. Having
defined a standard way of creating objects, the Sun built a plethora of standards and interfaces on it, that are the 
basis of the JEE specification.

Clearly, outside the JEE specification, this way of creating object is *insane*. It leads to objects that after creation
could be partially filled, does not favor immutability and breaks *information hiding*.

But, any solution of dependency injection in the Java ecosystem should also treat the &quot;Java bean&quot; way. To 
instruct the injector to use setter methods to create an object, annotate the setter methods with the `@Inject` 
annotation.
 
{% highlight java %}
public class MovieLister {
    private MovieFinder finder;
   
    // The injector first uses the default constructor to build an empty object
    public MovieLister() {}
    
    // Then, the injector uses annotated setter methods to resolve dependencies
    @Inject
    public void setFinder(MovieFinder finder) {
        this.finder = finder;
    }
}
{% endhighlight %}

#### The injector
There are many implementations in the Java ecosystem of dependency injectors. Each implementation differs from each 
others essentially for these features:
 
 - How the injector is configure to find the beans it has to manage
 - How it resolves the dependencies' DAG
 - How it maintains the instances of managed beans.
 
The mainstream injectors are the following:

 1. [Google Guice](https://github.com/google/guice): Guice is a lightweight dependency injection framework that uses 
    Java configuration, implements both types of injection (constructor and setter injection) and maintains managed 
    instances with a `Map<Class<?>, Object>`
 2. [Spring injector](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/beans.html): this component 
    is the core component of the Spring suite. It is not quite lightweight as Guice, 
    but it is fully integrated with the whole Spring ecosystem. It implements all type of injection; it provides an XML
    style of configuration and a Java style. Differently from Guice, the container is a `Map<String, Object>`, that 
    associates each managed instance with a label. It also support *auto discovery* of beans through classpath scanning  
 3. [Weld](http://weld.cdi-spec.org/): Weld is the reference implementation of the CDI specifications given in the JSR-299.
    To discover which beans it has to manage, it performs classpath scanning at the startup. You can also configure it
    using both Java configuration (factories) and XML configuration (`beans.xml`). Being the reference CDI
    implementation, it integrates very tightly with JEE, adding to simple DI concepts more sophisticated techniques to 
    manage enterprise beans.  

Clearly, the detailed presentation of the above frameworks is behind the scope of this post. However, let me to show an 
example of dependency resolution using Google Guice.

First of all, we have to configure the injector to find the beans it has to manage. In Guice the configuration is done
directly in Java, extending the framework class `AbstractModule`.

{% highlight java %}
public class MovieModule extends AbstractModule {
   @Override 
   protected void configure() {
      // Teach the container how to resolve the dependency
      bind(MovieFinder.class).to(ColonMovieFinder.class);
   }
}
{% endhighlight %}
 
The code above configures Guice to resolve every dependency from interface `MovieFinder` with its concrete implementation 
`ColonMovieFinder`. Clearly, `bind` is a method of the `AbstractModule` class, whereas `to` is a method of a class that 
implements the *builder design pattern* (`LinkedBindingBuilder`, for sake of completeness).

Using the `@Inject` annotation you can annotate every dependency you want to be resolved by Guice. Then, to create an
instance of the injector, you can use a factory method of the `Guice` class.

{% highlight java %}
public static void main(String[] args) {  
   // Guice.createInjector() takes your Modules, and returns a new     
   // Injector instance. Most applications will call this method 
   // exactly once, in their main() method.
   Injector injector = Guice.createInjector(new MovieModule());
   // Now that we've got the injector, we can build objects.
   MovieLister lister = injector.getInstance(MovieLister.class);
}
{% endhighlight %}
 
The factory method pass to the injector the classes that store the proper configuration. When you will ask to the 
injector an instance of a class that is annotated with an `@Inject` annotation and for which it is present a binding 
rule, the injector will do the magic for you. In the above example, the following steps are taken by the injector
 
 1. The `MovieLister` class definition is loaded within the framework
 2. The class is inspected and it is found that the class declares a dependency from the `MovieFinder` interface
 3. Guice looks at its configuration to find a concrete binding to the `MovieFinder` interface. The binding is found
    inside the `MovieModule` class
 4. Guice resolve the dependency with an instance of the `ColonMovieFinder` class, using the constructor of 
    `MovieLister` to create the new instance of the class  
 
That's so easy!
 
#### The story so far
Clearly, this is only the introduction of the *dependency injection* story. There are a lot of features that 
characterize this pattern. For example, the ability to decide if a class should be or not a *singleton*, using the 
`@Singleton` annotation on class definition.

#### Using dependency injection with Scala
Scala is a language that runs on top of the JVM. The language itself has it own techniques to deal with the dependency
injection. But, if you have to mix Java and Scala code inside the same project, you have to resume the JSR-330. The
`@Inject` annotation can be used also in the scala code.

{% highlight scala %}
class MovieLister @Inject() (val finder: MovieFinder) {
    // Body of the class
}
{% endhighlight %}

The only thing you have to remember is that the Scala syntax is different from the Java syntax. Scala mixes the 
definition of the class with the definition of its main constructor. Then, using the constructor injection means to add
a `@Inject` annotation immediately before the list of constructor arguments. 
  
But, why the hell have parenthesis to add a `()` couple of parenthesis after the annotation? The parenthesis are necessary 
because, otherwise, how could you tell if `(val finder: MovieFinder)` is constructor parameter list or arguments to 
`@Inject`?

#### What's next?
This small post is only an introduction to dependency injection. The internet community is divided on the real usefulness
of the pattern. In the next posts of this series I will try to analyze the pros and cons of using this pattern.
 
#### References
- [Chapter: Singleton (pag. 127). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Dependency Injection on SlideShare](http://www.slideshare.net/RiccardoCardin/design-pattern-architetturali-dependency-injection)
- [Inversion of Control Containers and the Dependency Injection pattern](http://martinfowler.com/articles/injection.html)
- [Scala and @Inject annotation](http://stackoverflow.com/questions/38630831/scala-and-inject-annotation)