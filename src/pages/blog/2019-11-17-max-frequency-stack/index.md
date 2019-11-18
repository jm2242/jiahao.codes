---
title: Maximum Frequency Stack - Leetcode
date: 2019-11-17
excerpt: Solving the Max Frequency Stack problem
tags: ["tech"]
---
<br/>

Today's random algorithms problem was the Maximum Frequency Stack question. You can find this problem on Leetcode [here](https://leetcode.com/problems/maximum-frequency-stack/submissions/). The goal of this problem is to implement `FreqStack` that has the following spec:

- a `push(int x)` function that appends integers onto the stack
- a `pop()` function that function differently than the typical `pop()` function of a stack. In this spec, this function returns the most frequent element in the stack. In this case of ties, the stack should break ties by the item that appears closest to the top of the stack.

`push()` is straightforward to reason about - it should just add the to the stack. Understanding `pop()` benefits from two examples:

``` python
# Stack State: [5,5,5,4,3,10,10,1]
pop() => 5

# One occurrence of 5 is removed, NOT from the top of the stack
# Stack State: [5,5,4,3,10,10,1]
pop() => 10

# 10 is removed as it appears closer to the top of the stack than 5
# Stack State: [5,5,4,3,10,1]
```

In summary, we are tasked to implement stubs `push()` and `pop()`:

``` python
class FreqStack(object):

    def __init__(self):
        pass


    def push(self, x):
        pass

```

## Initial Thoughts and Approach

Okay, at first glance this looks like a problem where I will need to use a few different data structures
to achieve a `pop()` function. It would be helpful to have a structure that captures both the frequency as well as the insertion order. However, it's not clear to me initially what to use. I can think of data structures that can accomplish one of those tasks each - a vanilla `list` for the insertion order, and a frequency hash (`dict`) for the frequency. But this still doesn't give us the MOST frequently occurring value, and more importantly doesn't store the history of most frequently occurring value, as we will need this to be able to call `pop()` in succession and return the correct value.

How about a priority queue? A priority queue will be able to give us the history that we need if we can somehow store in it each element's frequency of occurrence.


Okay, so a priority queue could be helpful to us. I'm using Python 2, so the go to library would be  [heapq](https://docs.python.org/2/library/heapq.html). This library provides a heap queue, which implements a min heap. One thing to note is `heapq`'s `pop()` method returns the item with the lowest priority. It's a bit strange to initialize:

``` python
import heapq

heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 6)

# access the min value without removing
heap[0] # => 5
```
Pushing integers will invoke the default comparison method - since 5 is smaller than 6, 5 will be returned. In this way, you push a bunch of values into the heap and be guaranteed to receive the values back in ascending order. For our problem, we need to think a bit more closely on what we are actually going to enqueue.

It is possible to push tuples into the heap, which will give us more flexibility. It will allow us to keep track of more information, which will be needed as we need the integer with maximum occurrence (and not just the most frequent occurrence). It will also allow us to choose the comparison method in the case of ties. So, how about we try popping/pushing out of the queue to keep track of the occurrences? My thinking is as follows - when calling `push()`, we will reinstantiate a heapq, and reinsert all of the items from the stack into the queue. We will also keep up to date a frequency `dict` and append the item to a stack.

Side question - how does the `heapq` deal with ties? Let's see:

![heapq break ties](ties_heapq.png)
*As expected, ties will be broken by the second element in the tuple*

But the question really is, what should we put in the second element?

This may be a bit of a leap here, but if we use a monotonic insertion counter, will be able to mimic the behavior of a stack as far as keeping track of insertion order goes. We always want to return the element with highest frequency, so the first element will be the actual frequency. Since the insertion order will always be unique, we'll be safe to use the last element of each tuple to store the integer itself. So we will be pushing tuple of the form `(frequency, insertion_order, element)`. `insertion_order` will be a counter that will be incremented with every insertion. One thing to also note is `heapq`'s `pop()` method returns the item with the lowest priority. This is the opposite of what we need, but we can accomplish this by negating the `frequency` as well as the `insertion_order` (actually, I will accomplish this by setting the `insertion_order` to `sys.maxint` and decrement the counter with each insertion).

To `pop` items, we will remove the lowest priority item, grab the `element` (3rd element of each tuple), reinsert the item with a decremented frequency `(frequency-1, insertion_order, element)`, and return `element`.

Here's a first crack (note, this implementation has a few issues. Can you spot them??):

``` python
import heapq
import sys
from collections import defaultdict

class FreqStack(object):

    def __init__(self):
        self.stack = []
        self.frequency = defaultdict(int)


    def push(self, x):
        """
        :type x: int
        :rtype: None
        """
        # first we need to add it to stack and make sure we keep track of freq
        self.stack.append(x)
        self.frequency[x] += 1

        # the heap will be used as a p queue to store the
        # elements in order number of occurences
        self.heap = []
        heapq.heapify(self.heap)
        insertion_counter = sys.maxint
        for elem in self.stack:
            freq = self.frequency[elem]
            # tuples of the form (frequency, insertion order, element)
            # storing the insertion order ensures we receive the most recently
            # inserted item into the stack first in the case of a tie
            heapq.heappush(self.heap, (-freq, insertion_counter, elem))

            insertion_counter -= 1



    def pop(self):
        """
        :rtype: int
        """
        # tuples of the form (-occurences, reverse_insertion_order, element)
        freq, insertion_counter, elem = heapq.heappop(self.heap)
        self.stack.remove(elem)

        # reinsert item with deceremented freq if freq is not 0
        # remember - the frequency is negated due to min heap implementation in python
        freq = freq + 1
        if freq < 0:
            heapq.heappush(self.heap, (freq, insertion_counter, elem))

        return elem
```

When running this code, we get the following error:

![Logical Errors in implementation](error.png)

First of all, it is a red flag that I am initializing a fresh queue every time we are we are calling `push()`. Inefficiency aside, there are a few logical errors too. One problem is that we are adding the same value multiple times into the queue, since we are putting each element in `self.stack` back in to the queue on every `push`. When we subsequently `pop()` and update the queue, we will end up popping only one of the potentially multiple occurrences, leaving stale information in the queue.

We need to rethink the use of the queue. It turns out that if we think about keeping track of the number of occurrences greedily (in other words, as we keep pushing integers), then this captures the information we need. Since the value returned by `pop()` has to depend on the number of occurrences, which will change as integers are popped, it is convenient to keep a fresh record for each occurrence of an integer. In this way, we keep track of the 'history' of insertions. Using the queue in this way will also allow us to move its instantiation into the constructor and do so only once.

Ok, let's now address this issue. We will refactor the queue into the `__init__` method and add only the element being pushed into the queue (one insertion per `push`). We will also remove the code that pushes tuples back into the queue when `pop()` is called, as that is also incorrect.

``` python
import heapq
import sys
from collections import defaultdict

class FreqStack(object):

    def __init__(self):
        self.stack = []
        self.frequency = defaultdict(int)

        # the heap will be used as a p queue to store the
        # elements in order number of occurences
        self.heap = []
        heapq.heapify(self.heap)
        self.insertion_counter = sys.maxint


    def push(self, x):
        """
        :type x: int
        :rtype: None
        """
        # first we need to add it to stack and make sure we keep track of freq
        self.stack.append(x)
        self.frequency[x] += 1
        freq = self.frequency[x]

        # tuples of the form (frequency, insertion order, element)
        # storing the insertion order ensures we receive the most recently
        # inserted item into the stack first in the case of a tie
        heapq.heappush(self.heap, (-freq, self.insertion_counter, x))

        self.insertion_counter -= 1


    def pop(self):
        """
        :rtype: int
        """
        # tuples of the form (-occurences, reverse_insertion_order, element)
        freq, insertion_counter, elem = heapq.heappop(self.heap)

        self.stack.remove(elem)
        self.frequency[elem] -= 1

        return elem
```

Okay, this is now a correct implementation. Leetcode now tells me my submission is faster than 5% of submissions, which is pretty slow. Can you spot some optimizations we can make?

First off - we are not actually utilizing the `self.stack` stack. Since we don't need to implement any additional methods, this is unused. We also incur a linear penalty when we call `.remove` on `self.stack`, as removing an element from a list in python incurs a linear cost. Let's get rid of it!

``` python

class FreqStack(object):

    def __init__(self):
        self.frequency = defaultdict(int)

        # the heap will be used as a p queue to store the
        # elements in order number of occurences
        self.heap = []
        heapq.heapify(self.heap)
        self.insertion_counter = sys.maxint


    def push(self, x):
        """
        :type x: int
        :rtype: None
        """
        self.frequency[x] += 1
        freq = self.frequency[x]

        # tuples of the form (frequency, insertion order, element)
        # storing the insertion order ensures we receive the most recently
        # inserted item into the stack first in the case of a tie
        heapq.heappush(self.heap, (-freq, self.insertion_counter, x))

        self.insertion_counter -= 1


    def pop(self):
        """
        :rtype: int
        """
        # tuples of the form (-occurences, reverse_insertion_order, element)
        freq, insertion_counter, elem = heapq.heappop(self.heap)
        self.frequency[elem] -= 1

        return elem
```



This brings us up to around the 11th percentile for time and 24th for space. It turns out that there is a more performant solution that utilizes a stack of stacks which you can find [here](https://leetcode.com/articles/maximum-frequency-stack/).

## Runtime and Space Analysis

Removal and addition from a queue is `O(logn)`, where `n` is the number of elements in the queue. For memory, we need to keep track of a queue as well as a dictionary. In the worst case, all elements will be distinct, and if there are `n` elements, the dictionary will be of size `O(n)`. THe queue also requires linear space. Therefore, our implementation for `push` is linear with respect to space.
