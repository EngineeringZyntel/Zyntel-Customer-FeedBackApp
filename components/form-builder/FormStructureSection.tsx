/**
 * Form Structure section for OpnForm-style layout: add field buttons + sortable field list
 */

'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FIELD_TYPES, type FieldType } from './FormBuilderLeftSidebar'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
  scaleLabels?: { min: string; max: string }
}

interface FormStructureSectionProps {
  fields: FormField[]
  onAddField: (fieldType: FieldType) => void
  updateField: (index: number, updates: Partial<FormField>) => void
  removeField: (index: number) => void
  addOption: (fieldIndex: number) => void
  updateOption: (fieldIndex: number, optionIndex: number, value: string) => void
  removeOption: (fieldIndex: number, optionIndex: number) => void
  onReorder: (newFields: FormField[]) => void
}

function SortableFieldRow({
  id,
  field,
  index,
  isExpanded,
  onToggle,
  updateField,
  removeField,
  addOption,
  updateOption,
  removeOption,
}: {
  id: string
  field: FormField
  index: number
  isExpanded: boolean
  onToggle: () => void
  updateField: (i: number, u: Partial<FormField>) => void
  removeField: (i: number) => void
  addOption: (i: number) => void
  updateOption: (i: number, oi: number, v: string) => void
  removeOption: (i: number, oi: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white overflow-hidden ${isDragging ? 'opacity-50 shadow-lg z-10' : ''}`}
    >
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a1 1 0 011 1v1h3V3a1 1 0 112 0v1h3a1 1 0 110 2h-3v1h3a1 1 0 110 2h-3v1h3a1 1 0 110 2h-3v1a1 1 0 11-2 0v-1h-3v1a1 1 0 11-2 0v-1H8v1a1 1 0 01-2 0V9H3a1 1 0 010-2h3V6H3a1 1 0 010-2h3V3a1 1 0 011-1zM5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 min-w-0 items-center justify-between px-2 py-2 text-left text-sm hover:bg-slate-50"
        >
          <span className="truncate font-medium text-slate-800">
            {field.label || '(No label)'}
          </span>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            {field.type}
          </span>
        </button>
      </div>
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-3">
          <Input
            label="Label"
            value={field.label}
            onChange={(e) => updateField(index, { label: e.target.value })}
            placeholder="Field label"
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={field.type}
              onChange={(e) => updateField(index, { type: e.target.value })}
            >
              <optgroup label="Questions">
                <option value="text">Short answer</option>
                <option value="textarea">Long answer</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="tel">Phone</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="link">URL</option>
                <option value="select">Dropdown</option>
                <option value="multiple">Multiple choice</option>
                <option value="checkbox">Checkboxes</option>
                <option value="rating">Rating</option>
                <option value="linearScale">Linear scale</option>
              </optgroup>
              <optgroup label="Layout">
                <option value="paragraph">Text</option>
                <option value="heading1">Heading 1</option>
                <option value="heading2">Heading 2</option>
                <option value="heading3">Heading 3</option>
                <option value="title">Title</option>
                <option value="label">Label</option>
                <option value="divider">Divider</option>
              </optgroup>
            </select>
          </div>
          {['select', 'multiple', 'checkbox'].includes(field.type) && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Options</label>
              <div className="space-y-1.5">
                {field.options?.map((opt, oi) => (
                  <div key={oi} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(index, oi, e.target.value)}
                      className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm"
                      placeholder={`Option ${oi + 1}`}
                    />
                    <Button type="button" variant="danger" size="sm" onClick={() => removeOption(index, oi)}>×</Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addOption(index)}>+ Option</Button>
              </div>
            </div>
          )}
          {(field.type === 'rating' || field.type === 'linearScale') && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Max</label>
              <input
                type="number"
                min={1}
                max={10}
                value={field.maxRating ?? 5}
                onChange={(e) => updateField(index, { maxRating: parseInt(e.target.value) || 5 })}
                className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          )}
          <Button type="button" variant="danger" size="sm" onClick={() => { removeField(index); onToggle() }}>
            Remove field
          </Button>
        </div>
      )}
    </div>
  )
}

export function FormStructureSection({
  fields,
  onAddField,
  updateField,
  removeField,
  addOption,
  updateOption,
  removeOption,
  onReorder,
}: FormStructureSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((_, i) => String(i) === active.id)
      const newIndex = fields.findIndex((_, i) => String(i) === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(fields, oldIndex, newIndex))
        setExpandedIndex(newIndex)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Add field */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Add field</p>
        <div className="grid grid-cols-2 gap-1.5">
          {FIELD_TYPES.slice(0, 12).map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onAddField(field)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-left text-xs font-medium text-slate-700 hover:border-[#0066FF] hover:bg-blue-50/50"
            >
              <span className="mr-1">{field.icon}</span>
              {field.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">Click to add to form. More types below.</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {FIELD_TYPES.slice(12).map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onAddField(field)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-left text-xs font-medium text-slate-700 hover:border-[#0066FF] hover:bg-blue-50/50"
            >
              <span className="mr-1">{field.icon}</span>
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sortable field list */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Fields ({fields.length}) — drag to reorder</p>
        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-4 text-center text-xs text-slate-500">
            No fields yet. Add one above.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={fields.map((_, i) => String(i))}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SortableFieldRow
                    key={index}
                    id={String(index)}
                    field={field}
                    index={index}
                    isExpanded={expandedIndex === index}
                    onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    updateField={updateField}
                    removeField={removeField}
                    addOption={addOption}
                    updateOption={updateOption}
                    removeOption={removeOption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
