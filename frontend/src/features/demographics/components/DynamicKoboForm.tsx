import React, { useState } from 'react';
import { XFormField } from '../../../utils/xformParser';
import { ChevronDown, ChevronRight, CheckCircle2, MapPin, Plus, Trash2 } from 'lucide-react';
import { evaluateKoboExpression } from '../../../utils/koboExpressionEvaluator';
import './DynamicKoboForm.css';

interface DynamicKoboFormProps {
  fields: XFormField[];
  onSubmit: (data: Record<string, any>) => void;
}

export const DynamicKoboForm: React.FC<DynamicKoboFormProps> = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderField = (field: XFormField, level = 0, repeatContext?: Record<string, any>, pathPrefix: string = '') => {
    // Check skip logic
    const isVisible = evaluateKoboExpression(field.relevant, formData, repeatContext);
    if (!isVisible) return null;

    const isGroup = field.type === 'group';
    const isRepeat = field.type === 'repeat';
    
    // Resolve full path name for data binding
    const fullPath = pathPrefix ? `${pathPrefix}.${field.name}` : field.name;

    const handleLocalChange = (val: any) => {
       if (pathPrefix) {
          // Complex update for nested objects in array
          const parts = pathPrefix.split('[');
          const arrayName = parts[0];
          const indexStr = parts[1].replace(']', '');
          const idx = parseInt(indexStr);

          setFormData((prev) => {
             const newArray = [...(prev[arrayName] || [])];
             if (!newArray[idx]) newArray[idx] = {};
             newArray[idx] = { ...newArray[idx], [field.name]: val };
             return { ...prev, [arrayName]: newArray };
          });
       } else {
          handleChange(field.name, val);
       }
    };

    const currentValue = pathPrefix && repeatContext 
      ? repeatContext[field.name] 
      : formData[field.name];

    if (isGroup) {
      const isExpanded = expandedGroups[field.name] !== false; // default true
      return (
        <div key={field.name} className="ss-group-card">
          <div 
            onClick={() => toggleGroup(field.name)}
            className={`ss-group-header ${isExpanded ? 'expanded' : ''}`}
          >
            {isExpanded ? <ChevronDown size={20} color="#0f766e" /> : <ChevronRight size={20} color="#64748b" />}
            <h3 className="ss-group-title">{field.label}</h3>
          </div>
          <div className={`ss-group-content ${isExpanded ? 'open' : ''}`}>
            {field.children?.map(child => renderField(child, level + 1, repeatContext, pathPrefix))}
          </div>
        </div>
      );
    }

    if (isRepeat) {
      const isExpanded = expandedGroups[field.name] !== false; // default true
      const repeatInstances = formData[field.name] || [];
      
      const addInstance = () => {
        setFormData(prev => ({
          ...prev,
          [field.name]: [...(prev[field.name] || []), {}]
        }));
      };

      const removeInstance = (idx: number) => {
        setFormData(prev => {
          const newArr = [...(prev[field.name] || [])];
          newArr.splice(idx, 1);
          return { ...prev, [field.name]: newArr };
        });
      };

      return (
        <div key={field.name} className="ss-group-card ss-repeat-card">
          <div 
            onClick={() => toggleGroup(field.name)}
            className={`ss-group-header ss-repeat-header ${isExpanded ? 'expanded' : ''}`}
          >
            {isExpanded ? <ChevronDown size={20} color="#0f766e" /> : <ChevronRight size={20} color="#0f766e" />}
            <h3 className="ss-group-title ss-repeat-title">{field.label} (पटक-पटक भर्न मिल्ने)</h3>
          </div>
          <div className={`ss-group-content ${isExpanded ? 'open' : ''}`}>
            {repeatInstances.map((instanceData: any, idx: number) => (
              <div key={idx} className="ss-repeat-instance">
                <button type="button" onClick={() => removeInstance(idx)} className="ss-repeat-remove-btn">
                  <Trash2 size={16} />
                </button>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>विवरण #{idx + 1}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {field.children?.map(child => renderField(child, level + 1, instanceData, `${field.name}[${idx}]`))}
                </div>
              </div>
            ))}
            <button type="button" onClick={addInstance} className="ss-add-btn">
              <Plus size={18} /> थप विवरण जोड्नुहोस्
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label className="ss-field-label">
          {field.label} {field.required && <span className="ss-required-asterisk">*</span>}
        </label>
        {field.hint && (
          <div className="ss-field-hint">{field.hint}</div>
        )}

        {field.type === 'input' && (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="ss-input-text"
            placeholder={`Enter ${field.label}...`}
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="ss-input-text"
            placeholder="0"
          />
        )}

        {field.type === 'geopoint' && (
          <div className="ss-geopoint-wrapper">
            <input
              type="text"
              readOnly
              placeholder="GPS Coordinates..."
              value={currentValue || ''}
              className="ss-input-text ss-geopoint-input"
            />
            <button 
              type="button"
              onClick={() => handleLocalChange('27.7172, 85.3240')}
              className="ss-geopoint-btn"
            >
              <MapPin size={16} /> GPS टिपोट
            </button>
          </div>
        )}

        {field.type === 'select1' && (
          <div className="ss-choice-group">
            {field.choices?.map(choice => (
              <label key={choice.id} className={`ss-choice-label ${currentValue === choice.value ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name={fullPath}
                  value={choice.value}
                  checked={currentValue === choice.value}
                  onChange={(e) => handleLocalChange(e.target.value)}
                  className="ss-choice-input"
                />
                <span className="ss-choice-text">{choice.label}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'select' && (
          <div className="ss-choice-group">
            {field.choices?.map(choice => {
              const currentValues: string[] = currentValue || [];
              const isChecked = currentValues.includes(choice.value);
              
              return (
                <label key={choice.id} className={`ss-choice-label ${isChecked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    value={choice.value}
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked 
                        ? [...currentValues, choice.value]
                        : currentValues.filter(v => v !== choice.value);
                      handleLocalChange(newValues);
                    }}
                    className="ss-choice-input"
                  />
                  <span className="ss-choice-text">{choice.label}</span>
                </label>
              );
            })}
          </div>
        )}

      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="ss-form-container">
      
      <div className="ss-header-card">
        <h2 className="ss-header-title">डिजिटल घरधुरी सर्भे (Smart Survey Engine)</h2>
        <p className="ss-header-subtitle">XML बाट अटो-जेनेरेट गरिएको डिजिटल फर्म</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {fields.map(f => renderField(f))}
      </div>

      <button type="submit" className="ss-submit-btn">
        <CheckCircle2 size={20} /> सर्भे डाटा सुरक्षित गर्नुहोस्
      </button>
    </form>
  );
};
