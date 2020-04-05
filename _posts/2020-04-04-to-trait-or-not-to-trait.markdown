---
layout: post
title:  "To Trait, or not to Trait?"
date:   2020-04-04 11:34:11
comments: true
categories: scala programming
tags:
    - scala
    - programming
summary: "Developers coming from object-oriented languages such as Java or C# know very well the difference between abstract classes and interfaces. The Scala programming language introduced a third contestant in the match: Traits."
social-share: true
social-title: "To Trait, or not to Trait?"
social-tags: "Scala, Programming"
math: false
reddit-link: "https://www.reddit.com/r/programming/comments/fvdhoi/to_trait_or_not_to_trait/"
---

Developers coming from object-oriented languages such as Java or C# know very well the difference between abstract classes and interfaces. The Scala programming language introduced a third contestant in the match: Traits.

Traits are very similar to Java 8 interfaces. They are abstract types, as interfaces, but they can also have properties that are not abstract and maintain state.

{% highlight scala %}
// Represents something that can be tested
trait Testable {
  // abstract fields
  val name: String
  val tests: List[Test[_]]
  // concrete methods
  def testsNames: List[String] = tests.map(_.name)
  // abstract type
  def setUp(): Unit
}
{% endhighlight %}

Both abstract classes and traits are abstract types. They can declare abstract fields and methods. However, their behavior is not interchangeably in many cases.

Let's see together, which are the differences between traits and abstract classes in Scala.

## The construction parameters problem

As any regular abstract class in other programming languages than Scala, abstract classes can declare constructors with parameters. Traits simply can't.

{% highlight scala %}
abstract class TestSuite(private val tests: List[Test]) {
  // The runAll is abstract. Every concrete type of TestSuite must
  // implement it
  def runAll(): Unit
}

// Compilation error
trait Testable(val name: String) {}
{% endhighlight %}

However, both types can have type parameters.

{% highlight scala %}
abstract class Test[Type](name: String) {
  def run(): Type
}

trait Result[Type] {
  def result: Type
}
{% endhighlight %}

## Many Traits, One Abstract Class

Another difference is that a class can implement many traits, but can extend only one abstract class.

{% highlight scala %}
// My class implements two traits, Testable and Loggable
// It must give an implementation of each abstract method
// declared in each trait
class MyClass extends Testable with Loggable { /*...*/ }
{% endhighlight %}

Traits gain this feature because the Scala language designers do not think of them as a form of inheritance. Traits fields and methods define a piece of reusable code that we can mix in classes. Indeed, Scala developers don't say that a class inherits from a trait. A class mix in a trait.

Besides, you can mix the extension of an abstract class with the implementation of many traits in the same class.

{% highlight scala %}
class EmptyLoggableTest(val id: String) extends Test[Unit](id) with Loggable {
  override def run(): Unit = info("Do nothing")
}
{% endhighlight %}


We can use traits to model behavior that a concrete class should have. From this point of view, they are very similar to Java 8 interfaces, pumped up with the possibility to declare fields, both abstract and concrete.

### Dynamic resolution of the “super” reference

The possibility to mix more than one trait in a class introduces a subtle difference between traits and abstract classes in Scala, the resolution of the super reference. The Scala runtime resolves the super reference in traits at runtime and not at compile time. Let's see an example.

{% highlight scala %}
trait LoggableResult[Type] extends Result[Type] with Loggable {
 abstract override def result: Type = {
   val res = super.result
   info("The result is $res")
   res
 }
}
{% endhighlight %}

As we can notice, the `LoggableResult` calls the super.result expression. The `Result` trait defines the result value as an abstract value. However, the compiler doesn't show any error. Why? Because of the [linearization rule](https://www.artima.com/pins1ed/traits.html#12.5). The call succeeds as long as the trait is mixed after a class or a trait that gives a concrete implementation of the abstract value.

For abstract classes, the Scala compiler resolves the super reference at compile-time, as in any other object-oriented programming language. 

## Traits and Java interference

At this point in the discussion, we may wonder why we should use an abstract class instead of a trait to model an abstract type. Traits seem to be much more flexible than abstract classes.

A possible problem in using traits is if we have to mix Scala and Java code. In detail, traits mix very severely with Java code. Traits can be called from Java code if and only if the Scala compiler can represent them as a Java 8 interface. Java allows the definition of abstract methods or concrete methods only. No concrete field implementation is allowed (see this link for further details).

Java code can use the following trait because of the absence of concrete fields.

{% highlight scala %}
// Scala code
trait CallableFromJava {
  def callableMethod(): Unit = println("You can call me from Java!")
  def methodToImplement(): Unit
}
{% endhighlight %}

{% highlight java %}
// Java code
public class MyJavaClass implements CallableFromJava {
    @Override
    public void methodToImplement() {
        // Do some stuff
    }
}
{% endhighlight %}

If we try to use the following trait from Java, we get the error _Class 'MyJavaClass' must either be declared abstract or implement abstract method 'logger()' in 'Loggable_.

{% highlight scala %}
trait Loggable {
  val logger: Logger = LoggerFactory.getLogger(getClass)
  def info(message: String) = logger.info(message)
}
{% endhighlight %}

The problem is the definition of the logger field. The Java compiler suggests implementing both the properties defined in `Loggable` trait. However, this is not the behavior we want.

We can try to treat the trait as if it would be an abstract class, extending it. However, the Java compiler immediately warns us, saying _No interface expected here_.

{% highlight java %}
// Java code
public class MyJavaClass extends Loggable { /* Implementation*/ }
{% endhighlight %}

## Conclusions

Traits in Scala are a potent tool that goes beyond the concepts that are present in object-oriented programming. Traits share many aspects with abstract classes, but they also have some subtle differences that we must be aware of when programming in Scala.

The last question we need to answer is which one to use, traits, or abstract classes when we need to introduce a new abstract type in our programs. Well, Martin Odersky, the original creator of the Scala programming language, suggests always starting with a trait. It's more flexible than abstract classes, and if you need, we can always change our mind later.

## References

- [What is the advantage of using abstract classes instead of traits?](https://stackoverflow.com/questions/1991042/what-is-the-advantage-of-using-abstract-classes-instead-of-traits)
- [To trait, or not to trait?](https://www.artima.com/pins1ed/traits.html#12.7)
- [When to use an abstract class in Scala (instead of a trait)](https://alvinalexander.com/scala/when-to-use-abstract-class-trait-in-scala/)
- [Scala Trait and Abstract Class](https://commitlogs.com/2016/10/01/scala-trait-and-abstract-class/)