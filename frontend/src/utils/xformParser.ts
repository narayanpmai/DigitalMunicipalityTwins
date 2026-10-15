export interface XFormChoice {
  id: string;
  label: string;
  value: string;
}

export interface XFormField {
  type: string; // 'input', 'select1', 'select', 'group', 'repeat', 'note', 'geopoint', 'number'
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  relevant?: string;
  jrCount?: string;
  choices?: XFormChoice[];
  children?: XFormField[];
}

export class XFormParser {
  private xmlDoc: Document | null = null;
  private translations: Record<string, string> = {};
  private binds: Record<string, any> = {};
  private instanceNodes: Record<string, any> = {};

  parse(xmlString: string): XFormField[] {
    const parser = new DOMParser();
    this.xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    this.extractTranslations();
    this.extractBinds();
    this.extractInstances();

    const body = this.xmlDoc.getElementsByTagName('h:body')[0] || this.xmlDoc.getElementsByTagName('body')[0];
    if (!body) return [];

    return this.parseNodes(body.children);
  }

  private extractTranslations() {
    this.translations = {};
    const itexts = this.xmlDoc?.getElementsByTagName('itext');
    if (!itexts || itexts.length === 0) return;

    // Usually takes the first translation block (often the default one)
    const translations = itexts[0].getElementsByTagName('translation');
    if (translations.length > 0) {
      const texts = translations[0].getElementsByTagName('text');
      for (let i = 0; i < texts.length; i++) {
        const textNode = texts[i];
        const id = textNode.getAttribute('id');
        const valueNode = textNode.getElementsByTagName('value')[0];
        if (id && valueNode) {
          this.translations[id] = valueNode.textContent || '';
        }
      }
    }
  }

  private extractBinds() {
    this.binds = {};
    const bindNodes = this.xmlDoc?.getElementsByTagName('bind');
    if (!bindNodes) return;

    for (let i = 0; i < bindNodes.length; i++) {
      const bind = bindNodes[i];
      const nodeset = bind.getAttribute('nodeset');
      if (nodeset) {
        // extract last part of nodeset as name
        const parts = nodeset.split('/');
        const name = parts[parts.length - 1];
        
        this.binds[name] = {
          type: bind.getAttribute('type'),
          required: bind.getAttribute('required') === 'true()',
          relevant: bind.getAttribute('relevant'),
        };
      }
    }
  }

  private extractInstances() {
    this.instanceNodes = {};
    const instances = this.xmlDoc?.getElementsByTagName('instance');
    if (!instances) return;

    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const id = instance.getAttribute('id');
      if (id) {
        // Find all <item> elements inside this instance
        const items = instance.getElementsByTagName('item');
        const parsedItems = [];
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          const nameNode = item.getElementsByTagName('name')[0];
          const labelNode = item.getElementsByTagName('label')[0];
          const itextIdNode = item.getElementsByTagName('itextId')[0];

          let value = nameNode ? nameNode.textContent || '' : '';
          let label = labelNode ? labelNode.textContent || '' : '';
          
          if (itextIdNode && itextIdNode.textContent) {
            label = this.translations[itextIdNode.textContent] || itextIdNode.textContent;
          }

          parsedItems.push({ id: `choice_${j}`, label, value });
        }
        this.instanceNodes[id] = parsedItems;
      }
    }
  }

  private resolveLabel(node: Element): string {
    const labelNode = node.getElementsByTagName('label')[0];
    if (!labelNode) return '';
    
    const ref = labelNode.getAttribute('ref');
    if (ref && ref.startsWith("jr:itext('") && ref.endsWith("')")) {
      const id = ref.substring(10, ref.length - 2);
      return this.translations[id] || id;
    }
    return labelNode.textContent || '';
  }

  private resolveHint(node: Element): string {
    const hintNode = node.getElementsByTagName('hint')[0];
    if (!hintNode) return '';
    
    const ref = hintNode.getAttribute('ref');
    if (ref && ref.startsWith("jr:itext('") && ref.endsWith("')")) {
      const id = ref.substring(10, ref.length - 2);
      return this.translations[id] || id;
    }
    return hintNode.textContent || '';
  }

  private parseNodes(nodes: HTMLCollection | null): XFormField[] {
    if (!nodes) return [];
    const fields: XFormField[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const tagName = node.tagName.toLowerCase();
      
      // Handle standard ODK tags (input, select1, select, group, repeat)
      if (['input', 'select1', 'select', 'group', 'repeat'].includes(tagName)) {
        const ref = node.getAttribute('ref') || node.getAttribute('nodeset');
        let name = '';
        if (ref) {
          const parts = ref.split('/');
          name = parts[parts.length - 1];
        }

        const field: XFormField = {
          type: tagName,
          name: name,
          label: this.resolveLabel(node),
          hint: this.resolveHint(node),
        };

        const bindInfo = this.binds[name] || {};
        field.required = bindInfo.required;
        field.relevant = bindInfo.relevant;
        
        if (tagName === 'repeat') {
          field.jrCount = node.getAttribute('jr:count') || undefined;
        }

        // If it has bind type like geonode, override type
        if (bindInfo.type === 'geopoint') {
           field.type = 'geopoint';
        } else if (bindInfo.type === 'int' || bindInfo.type === 'decimal') {
           field.type = 'number';
        }

        if (tagName === 'group' || tagName === 'repeat') {
          field.children = this.parseNodes(node.children);
        }

        if (tagName === 'select1' || tagName === 'select') {
          field.choices = [];
          
          // Check for static items
          const items = node.getElementsByTagName('item');
          if (items.length > 0) {
            for (let j = 0; j < items.length; j++) {
              const item = items[j];
              const valueNode = item.getElementsByTagName('value')[0];
              field.choices.push({
                id: `choice_${j}`,
                label: this.resolveLabel(item),
                value: valueNode ? valueNode.textContent || '' : '',
              });
            }
          } else {
            // Check for itemset (dynamic/instance items)
            const itemsets = node.getElementsByTagName('itemset');
            if (itemsets.length > 0) {
              const itemset = itemsets[0];
              const nodeset = itemset.getAttribute('nodeset');
              if (nodeset && nodeset.startsWith("instance('") && nodeset.includes("')")) {
                const instanceId = nodeset.split("instance('")[1].split("')")[0];
                if (this.instanceNodes[instanceId]) {
                  field.choices = [...this.instanceNodes[instanceId]];
                }
              }
            }
          }
        }

        fields.push(field);
      }
    }
    return fields;
  }
}
