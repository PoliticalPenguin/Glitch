## Indentation

When writing any block of code that is logically subordinate to the line immediately before and after it, that block should be indented two spaces more than the surrounding lines

  - Do not put any tab characters anywhere in your code. You would do best to stop pressing the tab key entirely.

  - Increase the indent level for all blocks by two extra spaces

    - When a line opens a block, the next line starts 2 spaces further in than the line that opened

      // good:
      if (condition) {
        action();
      }

      // bad:
      if (condition) {
      action();
      }

    - When a line closes a block, that line starts at the same level as the line that opened the block

      // good:
      if (condition) {
        action();
      }

      // bad:
      if (condition) {
        action();
        }

    - No two lines should ever have more or less than 2 spaces difference in their indentation. Any number of mistakes in the above rules could lead to this, but one example would be:

      // bad:
      transmogrify({
        a: {
          b: function(){
          }
      }});


## Variable names

A single descriptive word is best.

  // good:
  var animals = ['cat', 'dog', 'fish'];

  // bad:
  var targetInputs = ['cat', 'dog', 'fish'];

Collections such as arrays and maps should have plural noun variable names.

  // good:
  var animals = ['cat', 'dog', 'fish'];

  // bad:
  var animalList = ['cat', 'dog', 'fish'];

  // bad:
  var animal = ['cat', 'dog', 'fish'];

Name your variables after their purpose, not their structure

  // good:
  var animals = ['cat', 'dog', 'fish'];

  // bad:
  var array = ['cat', 'dog', 'fish'];

Language constructs

    Do not use for...in statements with the intent of iterating over a list of numeric keys. Use a for-with-semicolons statement in stead.

    // good:
    var list = ['a', 'b', 'c']
    for (var i = 0; i < list.length; i++) {
      alert(list[i]);
    }

    // bad:
    var list = ['a', 'b', 'c']
    for (var i in list) {
      alert(list[i]);
    }

    Never omit braces for statement blocks (although they are technically optional).

      // good:
      for (key in object) {
        alert(key);
      }

      // bad:
      for (key in object)
        alert(key);

    Always use === and !==, since == and != will automatically convert types in ways you're unlikely to expect.

      // good:

      // this comparison evaluates to false, because the number zero is not the same as the empty string.
      if (0 === '') {
        alert('looks like they\'re equal');
      }

      // bad:

      // This comparison evaluates to true, because after type coercion, zero and the empty string are equal.
      if (0 == '') {
        alert('looks like they\'re equal');
      }

    Don't use function statements for the entire first half of the course. They introduce a slew of subtle new rules to how the language behaves, and without a clear benefit. Once you and all your peers are expert level in the second half, you can start to use the more (needlessly) complicated option if you like.

      // good:
      var go = function () {...};

      // bad:
      function stop () {...};

Semicolons

    Don't forget semicolons at the end of lines

    // good:
    alert('hi');

    // bad:
    alert('hi')

    Semicolons are not required at the end of statements that include a block--i.e. if, for, while, etc.

  // good:
  if (condition) {
    response();
  }

  // bad:
  if (condition) {
    response();
  };

    Misleadingly, a function may be used at the end of a normal assignment statement, and would require a semicolon (even though it looks rather like the end of some statement block).

    // good:
    var greet = function () {
      alert('hi');
    };

    // bad:
    var greet = function () {
      alert('hi');
    }

