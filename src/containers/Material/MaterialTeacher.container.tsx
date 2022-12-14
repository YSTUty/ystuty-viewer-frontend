import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'clsx';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { red, green, teal, blue, yellow } from '@mui/material/colors';

import {
    Scheduler,
    WeekView,
    Appointments,
    AppointmentTooltip,
    AppointmentForm,
    DateNavigator,
    Toolbar,
    TodayButton,
    ViewSwitcher,
    MonthView,
    DayView,
    CurrentTimeIndicator,
    Resources,
    GroupingPanel,
} from '@devexpress/dx-react-scheduler-material-ui';
import { GroupingState, IntegratedGrouping, ViewState } from '@devexpress/dx-react-scheduler';

import RoomIcon from '@mui/icons-material/Room';
import TimeIcon from '@mui/icons-material/MoreTime';
import GroupsIcon from '@mui/icons-material/Groups2';
import LessonIcon from '@mui/icons-material/BookRounded';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import InfoIcon from '@mui/icons-material/Info';

import LessonFilter from '../../components/LessonFilter.component';
import LessonTypeSelector from '../../components/LessonTypeSelector.component';
import GroupGroupingControl from '../../components/GroupGroupingControl.component';
import { getTeachers } from '../../components/SelectTeacher.component';

import { TeacherLessonData, LessonFlags } from '../../interfaces/ystuty.types';
import scheduleSlice from '../../store/reducer/schedule/schedule.slice';
import * as lessonsUtils from '../../utils/lessons.utils';
import {
    classes as dxClasses,
    DayScaleCell,
    getTimeTableCell,
    StyledAppointmentsAppointment,
    StyledAppointmentsAppointmentContent,
    StyledGrid,
    StyledIcon,
    StyledToolbarFlexibleSpace,
    ToolbarWithLoading,
} from './dx.components';

const Appointment = ({ data, ...restProps }: Appointments.AppointmentProps) => (
    <StyledAppointmentsAppointment
        {...restProps}
        className={classNames({
            [dxClasses.parityOtherAppointment]: data.parity === 0,
            [dxClasses.parityOddAppointment]: data.parity === 1,
            [dxClasses.parityEvenAppointment]: data.parity === 2,
            [dxClasses.distantAppointment]: data.isDistant,
            [dxClasses.appointment]: true,
        })}
        data={data}
    />
);

const AppointmentContent = ({
    data,
    ...restProps
}: Appointments.AppointmentContentProps & {
    data: Appointments.AppointmentContentProps['data'] & TeacherLessonData & { teacherId?: number };
}) => {
    let title = `#${data.number}`;
    if (data.teacherId) {
        title += ` [${teachers?.find((e) => e.id === data.teacherId)?.name || data.teacherId}]`;
    }
    title += ` "${data.title}"\n`;
    title += `???? ??????????: ${data.timeRange}\n`;
    if (data.type !== 0) {
        title += `??? ?????? ??????????????: ${lessonsUtils.getLessonTypeStrArr(data.lessonType).join(', ')}\n`;
    }
    if (data.auditoryName) {
        title += `??? ??????????????????: ${data.auditoryName}\n`;
    }
    if (data.groups) {
        title += `??? ????????????: ${data.groups.join(', ')}`;
    }

    return (
        <StyledAppointmentsAppointmentContent {...restProps} data={data} title={title}>
            <div className={dxClasses.container}>
                {/* ???????????????????? */}
                <div className={dxClasses.text}>
                    #{data.number}
                    {data.teacherId && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: green['900'] }}>
                            {' ['}
                            {((e?: string) =>
                                e
                                    ?.split(' ')
                                    .map((e, i) => /* i === 0 ? e.slice(0, 5) : */ e[0])
                                    .join('.')
                                    .trim())(teachers?.find((e) => e.id === data.teacherId)?.name) || data.teacherId}
                            {']'}
                        </span>
                    )}{' '}
                    {data.title}
                </div>
                <div className={dxClasses.text}>???? {data.timeRange}</div>
                {data.type !== 0 && (
                    <div className={classNames(dxClasses.text, dxClasses.content)}>
                        ??? ?????? ??????????????: {lessonsUtils.getLessonTypeStrArr(data.lessonType).join(', ')}
                    </div>
                )}
                {data.auditoryName && (
                    <div className={classNames(dxClasses.text, dxClasses.content)}>
                        ??? ??????????????????: {data.auditoryName}
                    </div>
                )}
                {data.groups && (
                    <div className={classNames(dxClasses.text, dxClasses.content)}>
                        ??? ????????????: {data.groups.join(', ')}
                    </div>
                )}
            </div>
        </StyledAppointmentsAppointmentContent>
    );
};

const AppointmentTooltipContent = ({
    children,
    appointmentData,
    ...restProps
}: AppointmentTooltip.ContentProps & {
    appointmentData: AppointmentTooltip.ContentProps['appointmentData'] & TeacherLessonData & { teacherId?: number };
}) => (
    <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
        {appointmentData.isDistant && (
            <Grid container alignItems="center" color={red[800]}>
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <OnlinePredictionIcon />
                </StyledGrid>
                <Grid item xs={10}>
                    ??????????????
                </Grid>
            </Grid>
        )}
        {appointmentData.auditoryName && (
            <Grid container alignItems="center">
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <StyledIcon className={dxClasses.icon}>
                        <RoomIcon />
                    </StyledIcon>
                </StyledGrid>
                <Grid item xs={10}>
                    <span>
                        <b>{appointmentData.auditoryName}</b>
                    </span>
                </Grid>
            </Grid>
        )}
        {appointmentData.duration > 2 && (
            <Grid container alignItems="center">
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <StyledIcon className={dxClasses.icon}>
                        <TimeIcon />
                    </StyledIcon>
                </StyledGrid>
                <Grid item xs={10}>
                    <span>
                        ??????????????????????????????????: <b>{appointmentData.duration} ??</b>
                    </span>
                </Grid>
            </Grid>
        )}
        {appointmentData.lessonType !== 0 && (
            <Grid container alignItems="center">
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <StyledIcon className={dxClasses.icon}>
                        <LessonIcon />
                    </StyledIcon>
                </StyledGrid>
                <Grid item xs={10}>
                    ?????? ??????????????: <b>{lessonsUtils.getLessonTypeStrArr(appointmentData.lessonType).join(', ')}</b>
                </Grid>
            </Grid>
        )}
        {appointmentData.groups.length > 0 && (
            <Grid container alignItems="center">
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <StyledIcon className={dxClasses.icon}>
                        <GroupsIcon />
                    </StyledIcon>
                </StyledGrid>
                <Grid item xs={10}>
                    <span>{appointmentData.groups.join(', ')}</span>
                </Grid>
            </Grid>
        )}
        {!!1 && process.env.NODE_ENV === 'development' && (
            <Grid container alignItems="center">
                <StyledGrid item xs={2} className={dxClasses.textCenter}>
                    <StyledIcon className={dxClasses.icon}>
                        <InfoIcon />
                    </StyledIcon>
                </StyledGrid>
                <Grid item xs={10}>
                    <code>{JSON.stringify(appointmentData)}</code>
                </Grid>
            </Grid>
        )}
    </AppointmentTooltip.Content>
);

const FlexibleSpace = ({ ...props }: Toolbar.FlexibleSpaceProps) => (
    <StyledToolbarFlexibleSpace {...props} className={dxClasses.flexibleSpace}>
        <LessonFilter />
        <LessonTypeSelector />
        <GroupGroupingControl />
    </StyledToolbarFlexibleSpace>
);

const teachers = getTeachers();
const getResources = (selectedTeachers: number[] = []) => [
    {
        fieldName: 'teacherId',
        title: '??????????????????????????',
        instances: selectedTeachers.map((id, i) => ({
            id,
            text:
                ((e?: string) =>
                    e
                        ?.split(' ')
                        .map((e, i) => /* i === 0 ? e.slice(0, 5) : */ e[0])
                        .join('.')
                        .trim())(teachers?.find((e) => e.id === id)?.name) || `#${id}`,
            color: [green, blue, yellow, teal, red][i],
        })),
    },
    {
        fieldName: 'typeArr',
        title: 'Type',
        instances: [
            { id: LessonFlags.Lecture, text: '????????????', color: green },
            { id: LessonFlags.Practical, text: '????????????????', color: yellow },
            { id: LessonFlags.Labaratory, text: '?????????????????????? ????????????', color: blue },
            { id: LessonFlags.CourseProject, text: '???????????????? ????????????', color: red },
            { id: LessonFlags.Consultation, text: '????????????????????????', color: green },
            { id: LessonFlags.Test, text: '??????????', color: teal },
            { id: LessonFlags.DifferentiatedTest, text: '??????. ??????????', color: red },
            { id: LessonFlags.Exam, text: '??????????????', color: red },
            { id: LessonFlags.Library, text: '????????????????????', color: teal },
            { id: LessonFlags.ResearchWork, text: '????????????-?????????????????????????????????? ????????????', color: yellow },
            // etc...
        ],
        allowMultiple: true,
    },
];

const MaterialTeacherContainer = () => {
    const dispatch = useDispatch();
    const {
        lessonTypes,
        lessonFilter = '',
        selectedTeachers,
        groupsSplitColor,
        groupingGroups,
        isGroupByDate,
        fetchingSchedule,
        teacherScheduleData: scheduleData,
    } = useSelector((state) => state.schedule);
    const [data, setData] = React.useState<
        (TeacherLessonData & { startDate: Date; endDate: Date; teacherId?: number })[]
    >([]);

    React.useEffect(() => {
        const isComparing = scheduleData.length > 1;
        const allowedLessonTypes: Record<LessonFlags, any> = {};
        const data = [
            ...scheduleData.flatMap((data) =>
                data.data.map((e) => {
                    for (const type of e.typeArr) {
                        allowedLessonTypes[type] = true;
                    }
                    return {
                        ...e,
                        startDate: new Date(e.start),
                        endDate: new Date(e.end),
                        ...(isComparing && { teacherId: data.teacherId }),
                    };
                })
            ),
        ];
        dispatch(
            scheduleSlice.actions.setAllowedLessonTypes(
                Object.keys(allowedLessonTypes).map((e) => Number(e)) as LessonFlags[]
            )
        );
        setData(data);
    }, [setData, scheduleData]);

    const lowerCaseFilter = lessonFilter.toLowerCase();
    const dataMemo = React.useMemo(
        () =>
            data
                .filter((item) => lessonTypes.length < 1 || lessonTypes.some((type) => item.typeArr.includes(type)))
                .filter(
                    (dataItem) =>
                        dataItem.title?.toLowerCase()?.includes(lowerCaseFilter) ||
                        dataItem.auditoryName?.toLowerCase()?.includes(lowerCaseFilter) ||
                        dataItem.groups?.join(', ')?.toLowerCase()?.includes(lowerCaseFilter)
                ),
        [data, lessonTypes, lowerCaseFilter]
    );

    const mainResourceName = selectedTeachers.length > 1 && groupsSplitColor ? 'teacherId' : 'typeArr';
    const hasGroupingGroups = selectedTeachers.length > 1 && groupingGroups;

    return (
        <Paper style={{ height: 'calc(100vh - 56px)' }}>
            <Scheduler locale="ru" data={dataMemo} firstDayOfWeek={1}>
                <ViewState />
                {hasGroupingGroups && (
                    <GroupingState
                        grouping={[{ resourceName: mainResourceName }]}
                        groupByDate={
                            !isGroupByDate ? undefined : (viewName) => viewName === 'Week' || viewName === 'Month'
                        }
                    />
                )}

                <MonthView
                    dayScaleCellComponent={DayScaleCell}
                    timeTableCellComponent={getTimeTableCell(hasGroupingGroups)}
                />
                <WeekView startDayHour={6} endDayHour={23} excludedDays={[0]} />
                {/* <DayView displayName="Days" startDayHour={6} endDayHour={23} intervalCount={3} /> */}
                <DayView startDayHour={6} endDayHour={23} />

                <Appointments
                    appointmentComponent={Appointment}
                    appointmentContentComponent={AppointmentContent as any}
                />
                <AppointmentTooltip contentComponent={AppointmentTooltipContent as any} />
                <AppointmentForm readOnly />
                <Resources data={getResources(selectedTeachers)} mainResourceName={mainResourceName} />

                <CurrentTimeIndicator shadePreviousCells shadePreviousAppointments updateInterval={60e3} />
                <Toolbar
                    {...(fetchingSchedule ? { rootComponent: ToolbarWithLoading } : null)}
                    flexibleSpaceComponent={FlexibleSpace}
                />
                <DateNavigator />
                <ViewSwitcher />
                <TodayButton messages={{ today: '??????????????' }} />

                {hasGroupingGroups && <IntegratedGrouping />}
                {hasGroupingGroups && <GroupingPanel />}
            </Scheduler>
        </Paper>
    );
};

export default MaterialTeacherContainer;
