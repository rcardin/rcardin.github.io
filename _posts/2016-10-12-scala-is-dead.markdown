---
layout: post
title:  "Scala is dead, long live Scala!"
date:   2016-10-12 08:10:34
comments: true
categories: scala java programming
tags:
    - scala
    - java
    - programming
summary: "Recently I came across yet another post about the adoption of Scala in the IT world nowadays. The article is 
          'The Rise and Fall of Scala' on DZone. In that post the author describes the reasons of the failure of the 
          Scala language in becoming the next big general purpose programming language. But, are we sure that authors of
          Scala ever pretend the language to be used by every developer on the Planet? I don't think so."
social-share: true
social-title: "Scala is dead, long live Scala!"
social-tags: "Scala, java, programming"
---

Recently I came across yet another post about the adoption of Scala in the IT world nowadays. The article is 
"[The Rise and Fall of Scala](https://dzone.com/articles/the-rise-and-fall-of-scala)" on DZone. In that post the author 
describes the reasons of the failure of the Scala language in becoming the next big general purpose programming 
language. But, are we sure that authors of Scala ever pretend the language to be used by every developer on the Planet? 
I don't think so.

#### Introduction
First of all, who am I to write such an article? Basically, nobody. All I want to do is to report my experience with the 
Scala language in the last 5 years. I started learning Scala in 2013, attending at Martin Odersky Coursera courses. I 
read some books about Scala programming, among the others, "[Scala for the impatient](http://horstmann.com/scala/)" by 
Cay Horstmann (in my opinion, one of the best books about the Scala programming language). Last but not least, since 2015,
I worked as a senior developer in a Big-data project that uses the Scala programming language extensively.

Then, during the last years I had the opportunity to get an idea to the past, present and future of Scala.

#### As is
Have you ever installed the JDK from scratch? I know you had. Do you remember the image that remembers you there are
at least 3 billions of devices running Java out of there?

![3 billion devices](http://rcardin.github.io/assets/2016-10-09/Java-3-Billion.png)

It's a lot of application, don't you think? 20 years of Java applications, built on top of a huge amount of Java 
libraries. There are millions of developers who live and sustain their families creating and maintaining applications 
written in Java. Do you really think that some new language can really substitute Java nowadays?
   
I do not think so. But, let's have Scala a *chance*.

#### The language
For those of you that do not know it, Scala is an awesome programming language. Is it simple to master? No, it does not. 
Definitively. It's syntax is elegant and powerful, it but hides a lot of lessons learned from the design of older 
programming languages, Java on top.
    
For example, `class` declaration is mixed with constructor and attributes declaration.

{% highlight scala %}
class Person(val name: String, val surname: String)
{% endhighlight %}

There is a lot of concepts going on in the above example. The corresponding Java class will be the following.

{% highlight java %}
public class Person {
    private final String name;
    private final String surname;
    public Person(String name, String surname) {
        this.name = name;
        this.surname = surname;
    }
    public String getName() {
        return this.name;
    }
    public String getSurname() {
        return this.surname;
    }
}
{% endhighlight %} 

As you can see, a single row is traduced in more than ten lines in Java. A bunch of best practices and conventions are 
used to translate a simple line of code into a *not-so-naive* class declaration.

Taking another example, let's analyze the method `apply` of a class *companion object*. This is a native way to 
implement the *factory method* pattern, overly abused in all the modern interfaces. 
 
{% highlight scala %}
class Person(val name: String, val surname: String) 
object Person {
  def apply(json: String): Person = {
    val name = // Retrieve the name from json string
    val surname = // Retrieve the surname from json string
    new Person(name, surname)
  }
}
{% endhighlight %} 

The above example equals to implementing a static factory method, usually named `of`, in Java. And, if you choose to use 
a Scala `case class`, the companion object comes for free.

There a lot of other examples that proof that the Scala programming language incorporates a lot of software engineering 
best practice (have a look at the post [A (too) short introduction to Scala](http://rcardin.github.io/programming/scala/2015/05/21/a-too-short-introduction-to-scala.html) 
for more examples). You can deeply understand the process that brings the creators of the Scala language to take such 
decisions during the design only after some years of development.

How can we pretend that the vast majority of developers all over the world can immediately understand the subtle 
features of this language called Scala?

#### Functional programming
For years Scala was one of the few programming languages running on the JVM that mixes the object oriented paradigm with 
the functional paradigm. In 2015 came Java 8, that introduces *lambdas*. Many of you started to says that Scala would
die because Java, out favorite mainstream programming language, introduced the functional approach to.

Unluckily, it not sufficient to have lambdas to become a functional language. In fact, for many reasons, one for all 
the retro-compatibility, Java lambdas are very close to be only syntactic sugar for the use of *anonymous classes*.

Do you know that you can have functional code also in Java 5, 6 and 7?

{% highlight java %}
// Define a type for a Function with two parameters
public interface Function<T, U> {
  U apply(T arg);
}

// Implement a specific function
Function<Integer, Integer> square = new Function<Integer, Integer>() {
  @Override
  public Integer apply(Integer arg) {
    return arg * arg;
  }
};
{% endhighlight %}
 
Quite unpleasant, isn't it? To overcome the problem of define a custom type for each type of function and having a such 
verbose syntax, in Java 8 were added a bunch of \*`Function` types to the API and was added a special syntax to declare 
lambdas. Then, the above code in Java 8 becomes the following.

{% highlight java %}
Function<Integer, Integer> square = x -> x * x;
{% endhighlight %}

Is this sufficient to say that Java 8 is a functional programming language? Unfortunately, it is not. 

There are many features of "real" functional programming languages that lack in Java 8. One for all, it lacks the capability
of lambdas to close over variables. In fact, Java 8 lambda expressions can access variables of the outer scope if they 
are `final`, i.e. immutable. Java lambdas close over values only.

{% highlight java %}
final Integer three = Integer.valueOf(3);
Function<Integer, Integer> triple = x -> x * three;
{% endhighlight %}

Is this a real problem? Not at all. Many programming languages discourage to use such type of closures (a.k.a. 
*full-brown* closures).

The main functional feature that lacks in Java 8 is that **lambdas are not first class citizens**. Java 8 does not 
define any *function* type. Lambdas are implementations of interfaces with only one method 
(*functional interfaces*, or SAMs, classes implementing a single abstract method). What does this mean? 

First of all, there is no possibility to declare a signature of an anonymous function in Java 8. Indeed, the following
does not compile.

{% highlight java %}
public static void runCalc((BigInteger -> BigInteger) calc) {/* ... */} 
{% endhighlight %}

Once you have defined a *functional interface* to be passed as a parameter of the method `runCalc`, we still have some 
problems. Even the following code does not compile.
 
{% highlight java %}
interface MyCalcLambda {
    BigInteger run(BigInteger input);
} 
public static void runCalc(MyCalcLambda calc) {
    // You cannot use the functional interface as it was a function!
    System.out.println(calc(BigInteger.TEN));
}
{% endhighlight %} 

The only way you have to overcome to this problem is to call directly the method defined in the interface.

{% highlight java %}
public static void runCalc(MyCalcLambda calc) {
    System.out.println(calc.run(BigInteger.TEN));
}
{% endhighlight %}

In addition, Java 8 completely lacks of support for Pattern matching, *for-comprehension* syntax, ranges, and so on. 
Though these features are not intimately related with functional programming, they helps to work in such domain.

In conclusion, please stop saying that Java 8 has outclassed Scala as a functional programming language. 

#### Scala best
In conclusion, Java 8 and Scala are not comparable from many points of view. If Java can be defined a general purpose 
programming language, where can we use Scala effectively?

In my opinion the best application of Scala is in those domains that request a heavy load of mathematical concepts. An 
example is clearly Big Data domain. Scala constructs fit perfectly with data structures we find in Big Data libraries, 
i.e. Apache Spark. 

Spark `RDD[T]`, *Resilient Distributed Dataset*, looks like a collection at the top level of its abstraction. Then, 
Scala features related to collections manipulation fit perfectly to work with such kind of data structure.

#### Conclusion
As I tried to proof in this post, the aim of Scala was not that of substitute Java, not today, not in the future. The 
language has its own features, as any other existing language. These features subtend a lot of software engineering 
concepts. Also mathematics plays an important role in deep understanding of Scala. These facts clearly explains why 
Scala can not be a wide adoption language.
  
However, these fact also suggest in which field of information technology Scala can be successfully applied. Fields like
Big data or creation of DSL are the best environments for Scala.

In conclusion, please, stop writing articles and posts in which the dead of Scala is seen as certain. And if you think 
so, please, try to write an Apache Spark job using solely Java 8 first :)

**Post scriptum** 
Indeed, speaking about functional programming, neither Scala is a *pure* functional programming language. A *pure* 
functional programming language does not allow mutable values: Scala allows to declare `var` variable. However if you
try to define a ranking among programming languages to understand which is the nearest to pureness, certainly Scala is 
purer than Java 8.

**Post-post scriptum**
The Internet community is still debating about whether Java 8 lambda expressions are or are not first class citizens.

#### References
- [Chapter 2: Using function in Java. Functional Programming in Java: How to Improve Your Java Programs Using Functional 
Techniques, Pierre-Yves Saumont, 2016, Manning Pubns Co.](https://www.amazon.it/Functional-Programming-Java-Programs-Techniques/dp/1617292737/ref=sr_1_2?ie=UTF8&qid=1476079422&sr=8-2&keywords=functional+programming+in+java) 
- [Is Java 8 a Functional Programming Language?](http://www.beyondjava.net/blog/java-8-functional-programming-language/)
- [Java 8 lambda expression and first-class values](http://stackoverflow.com/questions/15221659/java-8-lambda-expression-and-first-class-values)
- [Java 8 dancing around functions as first class citizens?](http://stackoverflow.com/questions/22665150/java-8-dancing-around-functions-as-first-class-citizens)
- [What I miss in Java 8 lambda functions](http://blogs.atlassian.com/2014/03/miss-java-8-lambda-functions/)