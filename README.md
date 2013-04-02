jQuery-Form-Element-Repeater-Plugin
===================================

A jQuery plugin for creating repeatable form elements, i.e. an array of input elements with add/remove capabilities.

## Example Usage ##

To use the plugin, we have a few conventions in place.

```html
<div class="container">
  <div class="r-group">
    <p>
      <label for="vehicle_0_0" data-pattern-text="Vehicle Name +=:">Vehicle Name 1:</label>
      <input type="text" name="vehicle[0][name]" id="vehicle_0_name" data-pattern-name="vehicle[++][name]" data-pattern-id="vehicle_++_name" />
    </p>

    <p>
      <label for="vehicle_0_0" data-pattern-text="Vehicle Type +=:">Vehicle Type 1:</label>
      <input type="text" name="vehicle[0][type]" id="vehicle_0_type" data-pattern-name="vehicle[++][type]" data-pattern-id="vehicle_++_type" />
    </p>

    <p>
      <!-- Manually a remove button for the item. -->
      <!-- If one didn't exist, it would be added to overall group -->
      <button type="button" class="r-btnRemove">Remove -</button>
    </p>
  </div>

  <!-- The add button -->
  <button type="button" class="r-btnAdd">Add +</button>
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="jquery.form-repeater.js"></script>
<script>
$('.container').repeater({
  btnAddClass: 'r-btnAdd',
  btnRemoveClass: 'r-btnRemove',
  groupClass: 'r-group',
  minItems: 1,
  maxItems: 0,
  startingIndex: 0,
  reindexOnDelete: true,
  repeatMode: 'append',
  animation: null,
  animationSpeed: 400,
  animationEasing: 'swing',
  clearValues: true
});
</script>
```

## Config Options/Params ##

*  **btnAddClass:** The class name of the add button for creating new repeatable groups/items. _(string)_
*  **btnRemoveClass:** The class name of the remove button for deleting a repeatable group/item. _(string)_
*  **groupClass:** The class name of a newly created group/item DIV wrapper. _(string)_
*  **minItems:** The minimum number of items to display on load. _(integer, default 1)_
*  **maxItems:** The maximum number of allowable items/groups. 0 means unlimited. _(integer, default 0)_
*  **startingIndex:** The starting index for group items. _(integer, default 0)_
*  **reindexOnDelete:** Force re-index all group items on delete. _(boolean, default true)_
*  **repeatMode:** The type of insertion mode for new group items. _(string, default append)_
*  **animation:** Uh, I forgot. _(default null)_
*  **animationSpeed:** The default animation speed in milliseconds. _(integer, default 400)_
*  **animationEasing:** The easing animation effect. _(string, default 'swing')_
*  **clearValues:** Whether values should be cleared out when cloning. _(boolean, default true)_
