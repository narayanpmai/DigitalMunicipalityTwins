export function evaluateKoboExpression(
  expr: string | undefined,
  formData: Record<string, any>,
  repeatContext: Record<string, any> = {}
): boolean {
  if (!expr) return true; // if no expression, it's always relevant

  try {
    let cleanExpr = expr.trim();
    
    // Unescape XML entities
    cleanExpr = cleanExpr.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

    // Quick parse: split by ' or ' then ' and ' (giving AND higher precedence)
    const orParts = cleanExpr.split(/\s+or\s+/i);
    if (orParts.length > 1) {
      return orParts.some(part => evaluateKoboExpression(part, formData, repeatContext));
    }

    const andParts = cleanExpr.split(/\s+and\s+/i);
    if (andParts.length > 1) {
      return andParts.every(part => evaluateKoboExpression(part, formData, repeatContext));
    }

    // Check for selected() function
    const selectedMatch = cleanExpr.match(/selected\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/);
    if (selectedMatch) {
      let fieldPath = selectedMatch[1].trim();
      let expectedValue = selectedMatch[2].trim();
      
      if (expectedValue.startsWith("'") && expectedValue.endsWith("'")) expectedValue = expectedValue.slice(1, -1);
      if (expectedValue.startsWith('"') && expectedValue.endsWith('"')) expectedValue = expectedValue.slice(1, -1);
      
      const parts = fieldPath.split('/');
      const fieldName = parts[parts.length - 1].trim();
      
      let fieldValue = (repeatContext && fieldName in repeatContext) ? repeatContext[fieldName] : formData[fieldName];
      
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(expectedValue);
      } else if (typeof fieldValue === 'string') {
        return fieldValue.split(' ').includes(expectedValue);
      } else {
        return fieldValue == expectedValue;
      }
    }

    // Evaluate single condition: A = B, A != B, A > B, etc.
    const match = cleanExpr.match(/(.+?)\s*(=|!=|>|<|>=|<=)\s*(.+)/);
    if (!match) {
      return true; // Unparseable, default to showing it
    }

    let left = match[1].trim();
    const operator = match[2].trim();
    let right = match[3].trim();

    // Resolve left operand (usually a path)
    let leftValue: any = undefined;
    
    // Extract the field name from the path (e.g., /path/to/field or ../field)
    const parts = left.split('/');
    const fieldName = parts[parts.length - 1].trim();

    // Look up in repeat context first, then global formData
    if (repeatContext && fieldName in repeatContext) {
      leftValue = repeatContext[fieldName];
    } else {
      leftValue = formData[fieldName];
    }

    // Resolve right operand
    let rightValue: any = right;
    if (right.startsWith("'") && right.endsWith("'")) {
      rightValue = right.substring(1, right.length - 1);
    } else if (right.startsWith('"') && right.endsWith('"')) {
      rightValue = right.substring(1, right.length - 1);
    } else if (!isNaN(Number(right))) {
      rightValue = Number(right);
      leftValue = Number(leftValue); // coerce left to number for comparison
    }

    // In Kobo, empty / unselected is often treated as empty string
    if (leftValue === undefined || leftValue === null) {
      leftValue = '';
    }

    switch (operator) {
      case '=': return leftValue == rightValue;
      case '!=': return leftValue != rightValue;
      case '>': return leftValue > rightValue;
      case '<': return leftValue < rightValue;
      case '>=': return leftValue >= rightValue;
      case '<=': return leftValue <= rightValue;
      default: return true;
    }
  } catch (err) {
    console.warn('Failed to evaluate expression:', expr, err);
    return true; // Default to showing field if eval fails
  }
}
