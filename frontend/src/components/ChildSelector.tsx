import React from 'react';
import { Baby, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Child } from '@/types/family';

interface ChildSelectorProps {
  children: Child[];
  selectedChildIds: string[];
  onSelectionChange: (childIds: string[]) => void;
  allowMultiple?: boolean;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChildIds,
  onSelectionChange,
  allowMultiple = true
}) => {
  const toggleChild = (childId: string) => {
    if (allowMultiple) {
      if (selectedChildIds.includes(childId)) {
        onSelectionChange(selectedChildIds.filter(id => id !== childId));
      } else {
        onSelectionChange([...selectedChildIds, childId]);
      }
    } else {
      onSelectionChange([childId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(children.map(c => c.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const allSelected = selectedChildIds.length === children.length;
  const noneSelected = selectedChildIds.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Baby className="w-4 h-4 mr-2" />
          Filter by Child
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            disabled={allSelected}
            className="text-xs"
          >
            <Users className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={noneSelected}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {children.map((child) => {
          const isSelected = selectedChildIds.includes(child.id);
          return (
            <button
              key={child.id}
              onClick={() => toggleChild(child.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                {child.firstName[0]}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{child.firstName}</p>
                <p className="text-xs text-gray-500">Age {child.age}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!noneSelected && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing items for: {selectedChildIds.map(id => 
              children.find(c => c.id === id)?.firstName
            ).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;