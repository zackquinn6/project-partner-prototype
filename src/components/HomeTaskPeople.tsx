import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CalendarIcon, Edit2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Person {
  id: string;
  name: string;
  available_hours: number;
  available_days: string[];
  consecutive_days: number;
  diy_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  hourly_rate: number;
  availability_mode: 'general' | 'specific';
  availability_start_date?: string;
  availability_end_date?: string;
  specific_dates?: string[];
  not_available_dates?: string[];
}

interface HomeTaskPeopleProps {
  userId: string;
  homeId: string | null;
  onPeopleChange?: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function HomeTaskPeople({ userId, homeId, onPeopleChange }: HomeTaskPeopleProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'info' | 'not-available' | null>(null);
  const [editingDates, setEditingDates] = useState<Date[]>([]);
  const [editingStartDate, setEditingStartDate] = useState<Date | undefined>();
  const [editingEndDate, setEditingEndDate] = useState<Date | undefined>();
  const [editingSpecificDates, setEditingSpecificDates] = useState<Date[]>([]);
  const [newPerson, setNewPerson] = useState({
    name: '',
    available_hours: 8,
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    consecutive_days: 5,
    diy_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'professional',
    hourly_rate: 0,
    availability_mode: 'general' as 'general' | 'specific'
  });
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  useEffect(() => {
    fetchPeople();
  }, [userId, homeId]);

  const fetchPeople = async () => {
    let query = supabase
      .from('home_task_people')
      .select('*')
      .eq('user_id', userId);

    if (homeId) {
      query = query.eq('home_id', homeId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPeople(data as Person[]);
    }
  };

  const handleAddPerson = async () => {
    if (!newPerson.name.trim()) {
      return;
    }

    if (newPerson.availability_mode === 'general' && newPerson.available_days.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('home_task_people')
      .insert([{
        user_id: userId,
        home_id: homeId,
        ...newPerson
      }]);

    if (error) {
      return;
    }
    setNewPerson({
      name: '',
      available_hours: 8,
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      consecutive_days: 5,
      diy_level: 'intermediate',
      hourly_rate: 0,
      availability_mode: 'general'
    });
    fetchPeople();
    onPeopleChange?.();
  };

  const handleDeletePerson = async (personId: string) => {
    const { error } = await supabase
      .from('home_task_people')
      .delete()
      .eq('id', personId);

    if (error) {
      return;
    }

    fetchPeople();
    onPeopleChange?.();
  };

  const toggleDay = (day: string) => {
    setNewPerson(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  const handleEditPerson = (person: Person) => {
    setEditingPersonId(person.id);
    setEditMode('info');
    setEditingPerson({ ...person });
  };

  const handleSaveEdit = async () => {
    if (!editingPerson || !editingPersonId) return;

    const { error } = await supabase
      .from('home_task_people')
      .update({
        name: editingPerson.name,
        available_hours: editingPerson.available_hours,
        available_days: editingPerson.available_days,
        consecutive_days: editingPerson.consecutive_days,
        diy_level: editingPerson.diy_level,
        hourly_rate: editingPerson.hourly_rate,
        availability_mode: editingPerson.availability_mode,
        availability_start_date: editingPerson.availability_start_date,
        availability_end_date: editingPerson.availability_end_date,
        specific_dates: editingPerson.specific_dates
      })
      .eq('id', editingPersonId);

    if (error) return;

    setEditingPersonId(null);
    setEditMode(null);
    setEditingPerson(null);
    fetchPeople();
    onPeopleChange?.();
  };

  const handleEditNotAvailableDates = (person: Person) => {
    setEditingPersonId(person.id);
    setEditMode('not-available');
    const dates = (person.not_available_dates || []).map(d => new Date(d));
    setEditingDates(dates);
  };

  const handleSaveNotAvailableDates = async (personId: string) => {
    const dateStrings = editingDates.map(d => d.toISOString().split('T')[0]);
    
    const { error } = await supabase
      .from('home_task_people')
      .update({ not_available_dates: dateStrings })
      .eq('id', personId);

    if (error) return;

    setEditingPersonId(null);
    setEditMode(null);
    fetchPeople();
    onPeopleChange?.();
  };

  const handleEditAvailability = (person: Person) => {
    setEditingPersonId(person.id);
    setEditingPerson({ ...person });
    
    if (person.availability_start_date) {
      setEditingStartDate(new Date(person.availability_start_date));
    }
    if (person.availability_end_date) {
      setEditingEndDate(new Date(person.availability_end_date));
    }
    if (person.specific_dates) {
      setEditingSpecificDates(person.specific_dates.map(d => new Date(d)));
    }
  };

  const handleSaveAvailability = async (personId: string) => {
    const updates: any = {
      availability_mode: editingPerson?.availability_mode
    };

    if (editingPerson?.availability_mode === 'general') {
      updates.availability_start_date = editingStartDate?.toISOString().split('T')[0];
      updates.availability_end_date = editingEndDate?.toISOString().split('T')[0];
      updates.specific_dates = null;
    } else {
      updates.specific_dates = editingSpecificDates.map(d => d.toISOString().split('T')[0]);
      updates.availability_start_date = null;
      updates.availability_end_date = null;
    }

    const { error } = await supabase
      .from('home_task_people')
      .update(updates)
      .eq('id', personId);

    if (error) return;

    setEditingPersonId(null);
    setEditingPerson(null);
    setEditingStartDate(undefined);
    setEditingEndDate(undefined);
    setEditingSpecificDates([]);
    fetchPeople();
    onPeopleChange?.();
  };

  const handleCancelEdit = () => {
    setEditingPersonId(null);
    setEditMode(null);
    setEditingPerson(null);
    setEditingDates([]);
    setEditingStartDate(undefined);
    setEditingEndDate(undefined);
    setEditingSpecificDates([]);
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] md:text-xs text-muted-foreground">
        Manage team members available for this project
      </div>

      {/* Add new person form */}
      <div className="border rounded-lg p-2 md:p-3 space-y-2 bg-muted/30">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Name"
            value={newPerson.name}
            onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
            className="text-[10px] md:text-xs h-7 w-32"
          />
          <Select 
            value={newPerson.diy_level} 
            onValueChange={(val) => setNewPerson({ ...newPerson, diy_level: val as any })}
          >
            <SelectTrigger className="text-[10px] md:text-xs h-7 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 items-center">
            <Input
              type="number"
              min="1"
              max="24"
              value={newPerson.available_hours}
              onChange={(e) => {
                const val = Math.max(1, Math.min(24, parseInt(e.target.value) || 8));
                setNewPerson({ ...newPerson, available_hours: val });
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  setNewPerson({ ...newPerson, available_hours: 8 });
                }
              }}
              className="text-[10px] md:text-xs h-7 w-12"
            />
            <span className="text-[10px] md:text-xs whitespace-nowrap">hrs/day</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-[10px] md:text-xs">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newPerson.hourly_rate}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                setNewPerson({ ...newPerson, hourly_rate: val });
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  setNewPerson({ ...newPerson, hourly_rate: 0 });
                }
              }}
              className="text-[10px] md:text-xs h-7 w-16"
            />
            <span className="text-[10px] md:text-xs">/hr</span>
          </div>
          <div className="flex gap-1 items-center">
            <Input
              type="number"
              min="1"
              max="7"
              value={newPerson.consecutive_days}
              onChange={(e) => {
                const val = Math.max(1, Math.min(7, parseInt(e.target.value) || 5));
                setNewPerson({ ...newPerson, consecutive_days: val });
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  setNewPerson({ ...newPerson, consecutive_days: 5 });
                }
              }}
              className="text-[10px] md:text-xs h-7 w-12"
            />
            <span className="text-[10px] md:text-xs whitespace-nowrap">consec. days</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] md:text-xs font-medium mb-1.5">Availability Mode:</div>
          <div className="flex gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <Checkbox
                checked={newPerson.availability_mode === 'general'}
                onCheckedChange={() => setNewPerson({ ...newPerson, availability_mode: 'general' })}
                className="h-3 w-3"
              />
              <span className="text-[10px] md:text-xs">General (Days/Weeks)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <Checkbox
                checked={newPerson.availability_mode === 'specific'}
                onCheckedChange={() => setNewPerson({ ...newPerson, availability_mode: 'specific' })}
                className="h-3 w-3"
              />
              <span className="text-[10px] md:text-xs">Specific Dates</span>
            </label>
          </div>
        </div>

        {newPerson.availability_mode === 'general' && (
          <div>
            <div className="text-[10px] md:text-xs font-medium mb-1.5">Available Days:</div>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(day => (
                <label key={day} className="flex items-center gap-0.5 cursor-pointer">
                  <Checkbox
                    checked={newPerson.available_days.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                    className="h-2.5 w-2.5 md:h-3 md:w-3"
                  />
                  <span className="text-[10px] md:text-xs capitalize">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleAddPerson} size="sm" className="h-7 w-full text-[10px] md:text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add Team Member
        </Button>
      </div>

      {/* People list */}
      <div className="space-y-2">
        {people.length === 0 ? (
          <p className="text-[10px] md:text-xs text-muted-foreground text-center py-3">
            No team members yet. Add people to enable scheduling.
          </p>
        ) : (
          people.map((person) => (
            <div key={person.id} className="border rounded-lg p-2 md:p-3 space-y-2 text-[10px] md:text-xs">
              {editingPersonId === person.id && editMode === 'info' && editingPerson ? (
                // Edit mode
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={editingPerson.name}
                      onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                      className="text-[10px] md:text-xs h-7 w-32"
                    />
                    <Select 
                      value={editingPerson.diy_level} 
                      onValueChange={(val) => setEditingPerson({ ...editingPerson, diy_level: val as any })}
                    >
                      <SelectTrigger className="text-[10px] md:text-xs h-7 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1 items-center">
                      <Input
                        type="number"
                        min="1"
                        max="24"
                        value={editingPerson.available_hours}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(24, parseInt(e.target.value) || 8));
                          setEditingPerson({ ...editingPerson, available_hours: val });
                        }}
                        className="text-[10px] md:text-xs h-7 w-12"
                      />
                      <span className="text-[10px] md:text-xs whitespace-nowrap">hrs/day</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="text-[10px] md:text-xs">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingPerson.hourly_rate}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          setEditingPerson({ ...editingPerson, hourly_rate: val });
                        }}
                        className="text-[10px] md:text-xs h-7 w-16"
                      />
                      <span className="text-[10px] md:text-xs">/hr</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={editingPerson.consecutive_days}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(7, parseInt(e.target.value) || 5));
                          setEditingPerson({ ...editingPerson, consecutive_days: val });
                        }}
                        className="text-[10px] md:text-xs h-7 w-12"
                      />
                      <span className="text-[10px] md:text-xs whitespace-nowrap">consec. days</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] md:text-xs font-medium mb-1.5">Availability Mode:</div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={editingPerson.availability_mode === 'general'}
                          onCheckedChange={() => setEditingPerson({ ...editingPerson, availability_mode: 'general' })}
                          className="h-3 w-3"
                        />
                        <span className="text-[10px] md:text-xs">General</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={editingPerson.availability_mode === 'specific'}
                          onCheckedChange={() => setEditingPerson({ ...editingPerson, availability_mode: 'specific' })}
                          className="h-3 w-3"
                        />
                        <span className="text-[10px] md:text-xs">Specific Dates</span>
                      </label>
                    </div>
                  </div>

                  {editingPerson.availability_mode === 'general' && (
                    <div>
                      <div className="text-[10px] md:text-xs font-medium mb-1.5">Available Days:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS.map(day => (
                          <label key={day} className="flex items-center gap-0.5 cursor-pointer">
                            <Checkbox
                              checked={editingPerson.available_days.includes(day)}
                              onCheckedChange={() => {
                                const newDays = editingPerson.available_days.includes(day)
                                  ? editingPerson.available_days.filter(d => d !== day)
                                  : [...editingPerson.available_days, day];
                                setEditingPerson({ ...editingPerson, available_days: newDays });
                              }}
                              className="h-2.5 w-2.5 md:h-3 md:w-3"
                            />
                            <span className="text-[10px] md:text-xs capitalize">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="flex-1 h-6 text-[10px]"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex-1 h-6 text-[10px]"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{person.name}</div>
                      <div className="flex flex-wrap gap-1 md:gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                          {person.available_hours}h/day
                        </Badge>
                        <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                          {person.diy_level}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                          {person.consecutive_days} consec
                        </Badge>
                        {person.hourly_rate > 0 && (
                          <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                            ${person.hourly_rate}/hr
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                          {person.availability_mode === 'general' ? 'General' : 'Specific Dates'}
                        </Badge>
                      </div>
                      {person.availability_mode === 'general' && (
                        <div className="mt-1 text-[9px] md:text-[10px] text-muted-foreground">
                          {person.available_days.map(d => d.slice(0, 3)).join(', ')}
                          {person.availability_start_date && person.availability_end_date && (
                            <span className="ml-2">
                              ({format(new Date(person.availability_start_date), 'MMM d')} - {format(new Date(person.availability_end_date), 'MMM d')})
                            </span>
                          )}
                        </div>
                      )}
                      {person.availability_mode === 'specific' && person.specific_dates && (
                        <div className="mt-1 text-[9px] md:text-[10px] text-muted-foreground">
                          {person.specific_dates.length} specific date(s)
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPerson(person)}
                        className="h-5 w-5 md:h-6 md:w-6 p-0 flex-shrink-0"
                      >
                        <Edit2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePerson(person.id)}
                        className="h-5 w-5 md:h-6 md:w-6 p-0 text-destructive flex-shrink-0"
                      >
                        <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Availability Setup */}
                  <div className="pt-1.5 border-t">
                    {editingPersonId === person.id && editingPerson ? (
                      <div className="space-y-2">
                        {editingPerson.availability_mode === 'general' ? (
                          <div className="space-y-2">
                            <div className="text-[10px] font-medium">Date Range:</div>
                            <div className="flex gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] flex-1"
                                  >
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {editingStartDate ? format(editingStartDate, 'MMM d') : 'Start'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={editingStartDate}
                                    onSelect={setEditingStartDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] flex-1"
                                  >
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {editingEndDate ? format(editingEndDate, 'MMM d') : 'End'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={editingEndDate}
                                    onSelect={setEditingEndDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-[10px] font-medium">Specific Dates:</div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-6 text-[10px] justify-start"
                                >
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {editingSpecificDates.length > 0 ? `${editingSpecificDates.length} dates selected` : 'Select dates'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="multiple"
                                  selected={editingSpecificDates}
                                  onSelect={(dates) => setEditingSpecificDates(dates || [])}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveAvailability(person.id)}
                            className="flex-1 h-6 text-[10px]"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex-1 h-6 text-[10px]"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAvailability(person)}
                        className="h-6 w-full text-[10px] justify-start px-2"
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Setup Availability
                      </Button>
                    )}
                  </div>

                  {/* Not Available Dates */}
                  <div className="pt-1.5 border-t">
                    {editingPersonId === person.id && editMode === 'not-available' ? (
                      <div className="space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-6 text-[10px] justify-start"
                            >
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {editingDates.length > 0 ? `${editingDates.length} dates selected` : 'Select dates'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="multiple"
                              selected={editingDates}
                              onSelect={(dates) => setEditingDates(dates || [])}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveNotAvailableDates(person.id)}
                            className="flex-1 h-6 text-[10px]"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex-1 h-6 text-[10px]"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNotAvailableDates(person)}
                        className="h-6 w-full text-[10px] justify-start px-2"
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Not Available: {person.not_available_dates?.length || 0} dates
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}