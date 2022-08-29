import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import store2 from 'store2';
import { LessonFlags } from '../../../interfaces/ystuty.types';

export const STORE_GROUP_NAME_KEY = 'lastGroupName';
export const DEFAULT_GROUP: string = store2.get(STORE_GROUP_NAME_KEY, 'ЭИС-46');

const initialState = {
    selectedGroups: [DEFAULT_GROUP] as string[],
    lessonTypes: [
        LessonFlags.Lecture,
        LessonFlags.Labaratory,
        LessonFlags.Practical,
        LessonFlags.CourseProject,
        LessonFlags.Consultation,
        LessonFlags.Test,
        LessonFlags.DifferentiatedTest,
        LessonFlags.Exam,
        LessonFlags.Library,
        LessonFlags.ResearchWork,
    ],
    lessonFilter: '',
    groupsSplitColor: true,
    groupingGroups: false,
    isGroupByDate: true,
};

export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        toggleSelectedTypeLessons: (state, action: PayloadAction<LessonFlags>) => {
            const { lessonTypes } = state;
            const locationName = action.payload;

            if (lessonTypes.includes(locationName)) {
                state.lessonTypes = lessonTypes.filter((location) => location !== locationName);
                return;
            }
            lessonTypes.push(locationName);
        },
        updateLessonFilter: (state, action: PayloadAction<string>) => {
            state.lessonFilter = action.payload;
        },
        setSelected: (state, action: PayloadAction<string[]>) => {
            state.selectedGroups = action.payload;
        },
        onGroupOrderToggle: (state, action: PayloadAction<boolean | undefined>) => {
            state.isGroupByDate = action.payload ?? !state.isGroupByDate;
        },
        groupsSplitColorToggle: (state, action: PayloadAction<boolean | undefined>) => {
            state.groupsSplitColor = action.payload ?? !state.groupsSplitColor;
        },
        groupingGroupsToggle: (state, action: PayloadAction<boolean | undefined>) => {
            state.groupingGroups = action.payload ?? !state.groupingGroups;
        },
    },
});

export default scheduleSlice;
