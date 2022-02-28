import React from 'react';
import { useSelector } from 'react-redux';
import { useNetworkState } from 'react-use';
import store2 from 'store2';

import FullcalendarContainer from '../Fullcalendar/Fullcalendar';
import MaterialContainer from '../Material/Material';
// import SchedulerReact from '../SchedulerReact/SchedulerReact';

import { SelectGroupComponent } from '../../components/SelectGroup.component';
import { useScheduleLoader } from './scheduleLoader.util';

const BETA_CONFIRM_KEY = 'betaConfirm';

const ScheduleView = () => {
    const state = useNetworkState();
    const { selectedGroups } = useSelector((state) => state.schedule);
    const [scheduleData1, setScheduleData] = React.useState<any[]>([]);
    const [scheduleData2, setScheduleData2] = React.useState<any[]>([]);

    const [loadSchedule1, fetching1] = useScheduleLoader(setScheduleData);
    const [loadSchedule2, fetching2] = useScheduleLoader(setScheduleData2);
    const fetchingSchedule = React.useMemo(() => fetching1 || fetching2, [fetching1, fetching2]);

    React.useEffect(() => {
        const [groupName1, groupName2] = selectedGroups;
        loadSchedule1(groupName1);

        if (groupName2) {
            loadSchedule2(groupName2);
        } else {
            setScheduleData2([]);
        }
    }, [selectedGroups]);

    const scheduleData = React.useMemo(() => {
        const [name1, name2] = selectedGroups;
        const data = [{ name: name1, data: scheduleData1 }];
        if (scheduleData2.length > 0 && name2) {
            data.push({ name: name2, data: scheduleData2 });
        }
        return data;
    }, [selectedGroups, scheduleData1, scheduleData2]);

    React.useEffect(() => {
        const isConfirmed = store2.get(BETA_CONFIRM_KEY, false);
        if (!isConfirmed) {
            const confirm = window.confirm(
                'Сайт находится в Альфа версии!\n\nДанные могут быть ошибочны, а дизайн странным...\nТочно продолжить?'
            );
            store2.set(BETA_CONFIRM_KEY, confirm);
        }
    }, []);

    return (
        <>
            {process.env.NODE_ENV === 'development' && !state.online && <pre>{JSON.stringify(state, null, 2)}</pre>}
            <SelectGroupComponent fetchingSchedule={fetchingSchedule} />

            <hr />
            {!!1 ? (
                <MaterialContainer scheduleData={scheduleData} fetchingSchedule={fetchingSchedule} />
            ) : (
                // <SchedulerReact scheduleData={scheduleData} />
                <FullcalendarContainer scheduleData={scheduleData1} />
            )}
        </>
    );
};

export default ScheduleView;
