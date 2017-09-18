/** This file contains all functions connected to the SimpleSchema package. */

/** Function used to validate an entity against chosen attributes and return an object with custom error messages. */
SimpleSchema.prototype.validate = function(entity, attributes) {
	var context = this.newContext();
	var errors = {};
	var keys = _.keys(attributes);
	_.each(keys, function(key) {
		var error = attributes[key];
		if(!context.validateOne(entity, key)) {
			errors[key] = error;
		}
	});
	return errors;
}

/** Functions used to validate directly against a single field from the schema. **/
SimpleSchema.prototype.validateValue = function(value, field) {
  let object = {};
  object[field] = value;
  let context = this.newContext();
  return context.validateOne(object, field);
}

/** Error messages generates by SimpleSchema. **/
// [label] will be replaced with the field label
// [min] will be replaced with the minimum allowed value (string length, number, or date)
// [max] will be replaced with the maximum allowed value (string length, number, or date)
// [minCount] will be replaced with the minimum array count
// [maxCount] will be replaced with the maximum array count
// [value] will be replaced with the value that was provided to save but was invalid (not available for all error types)
// [type] will be replaced with the expected type; useful for the expectedConstructor error type
SimpleSchema.messages({
  required: "[label] is required",
  minString: "[label] must be at least [min] characters",
  maxString: "[label] cannot exceed [max] characters",
  minNumber: "[label] must be at least [min]",
  maxNumber: "[label] cannot exceed [max]",
  minDate: "[label] must be on or after [min]",
  maxDate: "[label] cannot be after [max]",
  badDate: "[label] is not a valid date",
  minCount: "You must specify at least [minCount] values",
  maxCount: "You cannot specify more than [maxCount] values",
  noDecimal: "[label] must be an integer",
  notAllowed: "[value] is not an allowed value",
  expectedString: "[label] must be a string",
  expectedNumber: "[label] must be a number",
  expectedBoolean: "[label] must be a boolean",
  expectedArray: "[label] must be an array",
  expectedObject: "[label] must be an object",
  expectedConstructor: "[label] must be a [type]",
  regEx: [
    {msg: "[label] failed regular expression validation"},
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}
  ],
  keyNotInSchema: "[key] is not allowed by the schema"
});