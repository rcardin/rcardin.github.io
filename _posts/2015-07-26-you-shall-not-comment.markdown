---
layout: post
title:  "You shall not comment!"
date:   2015-07-26 19:26:00
comments: true
categories: programming
tags:
    - clean-code
summary: "When I was attending the course of Computer Science at the University they told me that I have to document my 
          code. In this way, the developers that would come after me could understand easily the code I had wrote.
          Writing good comments is an hard task, if it is possible at all. In this article I will try to explain you 
          why."
social-share: true
social-title: "You shall not comment!"
social-tags: "programming, cleancode, coding, softwareengineering"
---
Last week I was working on a change request for a product that nowadays has more or less six years of life. Many
hands have coded on that project in these years, which means to have different programming styles and different kinds 
of solutions on the same project .

In detail, I was reading a class and I found this piece of code:

{% highlight java %}
public class Verifier {
    public boolean verify(/* Some arguments */) {
        boolean result = true;
        // Omissis...
        
        // Returns true if the condition holds
        if (/* Some condition */) {
            result = false;
        }
        
        return result;
    }
}
{% endhighlight %}

Do you notice something strange? Do you feel that smell...? Bingo! The comment of the `if` condition was clearly wrong.
Probably, the code was copied from another class and then modified. The problem is: which is the correct thing? Is it
the code? Is it the comment? (For sake of completeness, the code was the correct part of the method).

This true story allows me to introduce the main focus of this article: *comments in software coding*.

## The story so far

When I was attending the course of Computer Science at the University they told me that I had to document my code. In
this way, the developers that would come after me would have understood easily the code I had wrote. Someone else than me 
could have corrected or evolved what I've produced. It is something called *software engineering*. This discipline aims to 
engineer the production of software, giving a definition of software quality and trying to enforce an high grade of this
quality during the production process.

One way to control quality is to define some metrics. Having some common benchmarks that we can refer to, the  
production process of software might be changed to obtain values for those metrics that are as much closer as possible to the
benchmarks.

One of the metrics that is used is [Density of comments](http://staff.unak.is/andy/StaticAnalysis0809/metrics/dc.html).

> Density of Comments (DC) provides the ratio of comment lines (CLOC) to all lines (LOC). Hence, DC = CLOC / LOC. The 
  density of comments value will be between 0.0 and 1.0 and it can be used as a quality indicator to see how much of 
  the code is commented.
  
Looking at this metric it seems that the more I comment my code, the better quality will be achieved. The benchmark
for the *DC* metric is between 0.2 and 0.4. Then, the following code should gain a very good ranking in the quality scale.
 
{% highlight java %}
/**
 * Addition between integer values.
 */
public class Sum implements Operation {

    /**
     * Default ctor.
     */
    public Sum() {
       // Empty body
    }

    /**
     * Given the integers {@code a} and {@code b} returns the sum
     * between them.
     *
     * @param a The first operand
     * @param b The second operand
     *
     * @return The sum between {@code a} and {@code b}
     */
    public int execute(int a, int b) {
        // Declaring the variable that will contain the result of the sum
        int sum = 0;
        // Summing the two operands
        sum = a + b;
        // Returning the sum
        return sum;
    }
}
{% endhighlight %}

The previous code hits a DC score greater than **0.6**. Then, the quality of a development process that produces that 
code should be very high. Instead, the code of the class `Sum` is not considered quite good. Let me tell you why.
 
### The problem about comments

As Robert C. "Uncle Bob" Martin wrote in his book [Clean Code](http://www.amazon.it/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882):

> Why am I so down on comments? Because they lie. Not always, and not intentionally, but too often. The older a comment 
  is, and the farther away it is from the code it describes, the more likely it is to be just plain wrong. The reason is
  simple. Programmers can't realistically maintain them.
  
As you may know, every line of code has an own life. It was written; it is executed and tested; it will be
modified and maintained. We use comments to simplify the reading of the code that we produced. Comments are a *property* of
the code. In a certain way, they are owned by the code. The problem is that often **we have not time to maintain them
accordingly with the code**.

Uncle Bob in his book said that

> The proper use of comments is to compensate for our failure to express ourself in code. Note that I used the word 
  *failure*. I meant it. Comments are always failures. We must have them because we cannot always figure out how to 
  express ourselves without them, but their use is not a cause for celebration.
  
The code has to comment itself. The names we give to variables, functions, methods and classes have to tell us a
story, the story of what is the requirements that are satisfied by that code. This is why one could simply say:
 
![You shall not comment!!!](http://rcardin.github.io/assets/2015-07-13/you_shall_not_comment.jpg)

For the reasons above, a class like the following has not to be considered a good example:

{% highlight java %}
public class Person {
    private final String n;
    private final String s;
    
    public Person(String n, String s) {
        this.n = n;
        this.s = s;
    }
    
    public String getN() {
        return n;
    }
    
    public String getS() {
        return s;
    }
}
{% endhighlight %}

### And so? What have I to do?!

As Brian W. Kernighan and P. J. Plaugher said in their book 
[The Elements of Programming Style](http://www.amazon.com/The-Elements-Programming-Style-Edition/dp/0070342075),

> Don't comment bad code - rewrite it.

For example, considered the following code:

{% highlight java %}
// Check to see if the employee is eligible for full benefits
if ((employee.flags & HOURLY_FLAG) && (employee.age > 65))
    // ...
{% endhighlight %}

Would not be cleaner if you rewrote it as the following?

{% highlight java %}
if (employee.isEligibleForFullBenefits())
    // ...
{% endhighlight %}

Every time you need to write a comment, ask yourself if it would not be better to refactor your code to make it more 
understandable. From this point of view, thinking about comments forces us to reason about the code we're developing
and it forces us to reason about the causes that make the code so obscure and not clear. *Comments are not bad at all!* :)

Clearly this is a process that requests time and dedication. It is not possible that the code developed by a junior 
developer is as clear as the code developed by a senior developer. The first one will contain a lot of comments,
through which the programmer will try to show us what were its intents.

I think that, as always happens, the truth stands in the middle. The extremisms are always bad things. Then, there are cases
in which comments are useful. Also Uncle Bob identifies some kinds of *good comments*:

 * **Informative comments**: this kind of comments tries to give us some basic information about the code.
{% highlight java %}
// format matched kk:mm:ss EEE, MMM dd, yyyy
Pattern timeMatcher = Pattern.compile("\\d*:\\d*:\\d* \\w*, \\w* \\d*, \\d*");
{% endhighlight %} 
 * **Explanation of intent**: this kind of comments are used by the developer to inform the reader about the why he 
   took a particular decision.
 * **Warning of consequences**: with this kind of comments the developer tries to warn other programmers about certain 
   consequences.
{% highlight java %}
//SimpleDateFormat is not thread safe, so we need to create each instance independently.
SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z");
df.setTimeZone(TimeZone.getTimeZone("GMT"));
{% endhighlight %}   
 * **TODO comments**: use this kind of comments sparingly. `TODO` are jobs that a developer has to do, but he can't do
   at the moment. Scan through them regularly and eliminates the ones you can.
 * **Javadoc in public APIs**: need I say more? ;)
 
In conclusion, every time you will find yourself to write some comments to code, ask yourself if you can rewrite a
better code instead of using comments.
 
## References

- [Chapter IV: Comments. Clean Code: A Handbook of Agile Software Craftsmanship, 
   Robert C. Martin, 2008, Prentice Hall](http://www.amazon.it/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882):