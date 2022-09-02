import React from 'react';
import { useHash, useNetworkState } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import store2 from 'store2';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

import scheduleSlice, { getDefaultGroup, STORE_GROUP_NAME_KEY } from '../store/reducer/schedule/schedule.slice';
import alertSlice from '../store/reducer/alert/alert.slice';
import { apiPath } from '../utils';

const STORE_CACHED_INSTITUTES_KEY = 'CACHED_INSTITUTES';

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        '& ul': { margin: 0 },
        '& li': { margin: 0 },
    },
});

const MyPopper = (props: PopperProps) => <StyledPopper {...props} style={{ width: 350 }} />;

export const SelectGroupComponent = (props: {
    allowMultipleGroupsRef: React.MutableRefObject<(state?: any) => void>;
}) => {
    const { allowMultipleGroupsRef } = props;
    const dispatch = useDispatch();
    const {
        selectedGroups: selected,
        fetchingSchedule,
        allowedMultipleGroups: allowedMultiple,
    } = useSelector((state) => state.schedule);

    const { online, previous: previousOnline, since } = useNetworkState();
    const [hash, setHash] = useHash();
    const defaultValues = React.useMemo(() => {
        const groupName = getDefaultGroup();
        const defaultHash = decodeURI(hash.slice(1)) || groupName;
        const values = defaultHash.split(',');
        store2.set(STORE_GROUP_NAME_KEY, values[0]);
        return values;
    }, [hash]);
    const [institutes, setInstitutes] = React.useState<{ name: string; groups: string[] }[]>([
        { name: 'Default', groups: defaultValues },
    ]);
    const [fetching, setFetching] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

    const applyInstitutes = React.useCallback(
        (items: { name: string; groups: string[] }[] | null) => {
            if (!items) {
                items = store2.get(STORE_CACHED_INSTITUTES_KEY, null);
                if (!items) {
                    return;
                }
                setIsCached(true);
            } else if (items.length > 0) {
                store2.set(STORE_CACHED_INSTITUTES_KEY, items);
                setIsCached(false);
            }

            // items.sort();
            setInstitutes(items);
        },
        [setInstitutes, setIsCached]
    );

    const loadGroupsList = React.useCallback(() => {
        if (fetching) {
            return;
        }

        // setInstitutes([]);
        setFetching(true);

        fetch(`${apiPath}/ystu/schedule/institutes?extramural=true`)
            .then((response) => response.json())
            .then(
                (
                    response:
                        | { items: { name: string; groups: string[] }[] }
                        | { error: { error: string; message: string } }
                ) => {
                    if ('error' in response) {
                        dispatch(
                            alertSlice.actions.add({
                                message: `Error: ${response.error.message}`,
                                severity: 'warning',
                            })
                        );
                        return;
                    }
                    applyInstitutes(response!.items);
                }
            )
            .catch((e) => {
                applyInstitutes(null);
                if (online) {
                    dispatch(
                        alertSlice.actions.add({
                            message: `Error: ${e.message}`,
                            severity: 'error',
                        })
                    );
                }
            })
            .finally(() => {
                setFetching(false);
            });
    }, [fetching, setFetching, applyInstitutes, online]);

    const onChangeValues = React.useCallback(
        (value: string | string[] | null) => {
            const groupName = getDefaultGroup();
            value = typeof value === 'string' ? value.split(',') : value || [groupName];
            let values: string[] = value.length > 0 ? value : [groupName];
            const maxGroups = 4 - 1;
            values = values.length > maxGroups ? [values[0], ...values.slice(-maxGroups)] : values;

            if (values.some((e, i) => selected[i] !== e) || values.length !== selected.length) {
                dispatch(scheduleSlice.actions.setSelectedGroups(values));
                setHash(values.join(','));
                store2.set(STORE_GROUP_NAME_KEY, values[0]);
            }
        },
        [dispatch, setHash, selected]
    );

    const fixSelected = React.useCallback(
        (_selected: string[] = selected) => {
            let value = _selected;
            const groups = institutes.flatMap((e) => e.groups.map((e) => e));
            if (groups.length > 1) {
                const lowerGroups = groups.map((e) => e.toLowerCase());
                const lowerSelected = _selected.map((e) => e.toLowerCase());
                value = lowerSelected
                    .map((e) => lowerGroups.findIndex((g) => g === e))
                    .filter((e) => e > -1)
                    .map((e) => groups[e]);
                value = value.filter((w, i) => value.indexOf(w) === i);
            }
            onChangeValues(value);
        },
        [institutes, selected, onChangeValues]
    );

    const allowMultiple = React.useCallback(
        (state = true) => {
            dispatch(scheduleSlice.actions.setAllowedMultipleGroup(state));
            if (!state) {
                const value = selected[0];
                onChangeValues(value);
            }
        },
        [onChangeValues, selected]
    );

    // Check correct names after institutes loading
    React.useEffect(() => {
        if (institutes.length > 1) {
            fixSelected();
        }
    }, [institutes]);

    // On location hash changed
    React.useEffect(() => {
        if (defaultValues.some((e, i) => selected[i] !== e) || defaultValues.length !== selected.length) {
            fixSelected(defaultValues);
        }
    }, [defaultValues]);

    React.useEffect(() => {
        if (online && (online !== previousOnline || (since && Date.now() - since.getTime() > 2 * 60e3))) {
            loadGroupsList();
        }
    }, [online, previousOnline, since]);

    React.useEffect(() => {
        loadGroupsList();
        fixSelected(defaultValues);

        if (window.location.search.includes('allow_multiple')) {
            allowMultiple();
        }
        allowMultipleGroupsRef.current = allowMultiple;
    }, []);

    const isMultiple = allowedMultiple || selected.length > 1;

    const options = React.useMemo(
        () =>
            institutes.reduce(
                (prev, cur) => ({ ...prev, ...Object.fromEntries(cur.groups.map((g) => [g, cur.name])) }),
                {} as Record<string, string>
            ),
        [institutes]
    );

    return (
        <Autocomplete
            multiple={isMultiple}
            sx={{ minWidth: 200, maxWidth: 400 }}
            id="grouped-native-select"
            options={Object.keys(options)}
            disableCloseOnSelect
            disableListWrap
            getOptionLabel={(option) => option}
            groupBy={(option) => options[option]}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={`Групп${isMultiple ? 'ы' : 'а'}`}
                    placeholder={((e) => e[Math.floor(Math.random() * e.length)])(Object.keys(options))}
                />
            )}
            PopperComponent={MyPopper}
            value={!isMultiple && Array.isArray(selected) ? selected[0] : selected}
            onChange={(event, newValue, reason) => {
                if (
                    event.type === 'keydown' &&
                    (event as React.KeyboardEvent).key === 'Backspace' &&
                    reason === 'removeOption'
                ) {
                    return;
                }
                onChangeValues(newValue);
            }}
            disabled={!!fetchingSchedule}
        />
    );
};
