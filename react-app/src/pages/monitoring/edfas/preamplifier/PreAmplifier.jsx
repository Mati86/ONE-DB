import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import useApiPoll from '../../../../hooks/useApiPoll';
import useDataPollInterval from '../../../../hooks/useDataPollInterval';
import {
  EDFA_PARAMS,
  EDFA_PLOTTABLE_PARAMETERS,
  EDFA_TYPE,
} from '../../../../utils/data';
import { getReadApiPayloadForEdfa, pickKeys } from '../../../../utils/utils';
import Layout from '../../../common-components/Layout';
import EdfaMonitoredData from '../EdfaMonitoredData';

const readApiPayloadForEdfa = getReadApiPayloadForEdfa(EDFA_TYPE.Preamplifier, [
  EDFA_PARAMS.EntityDescription,
  EDFA_PARAMS.OperationalState,
  EDFA_PARAMS.InputPower,
  EDFA_PARAMS.OutputPower,
  EDFA_PARAMS.MeasuredGain,
]);

function Preamplifier() {
  const [monitoredData, setMonitoredData] = useState([]);
  const pollInterval = useDataPollInterval();

  const data = useApiPoll(pollInterval, readApiPayloadForEdfa);

  useEffect(() => {
    if (data) {
      setMonitoredData(prev => {
        let newData = [...prev];
        newData.unshift({
          name: 0,
          ...pickKeys(data.data, Array.from(EDFA_PLOTTABLE_PARAMETERS)),
        });
        return newData.slice(0, 7).map((data, index) => {
          return {
            ...data,
            name: (index * (pollInterval / 1000)).toString(),
          };
        });
      });
    }
  }, [data, pollInterval]);

  return (
    <Layout>
      <Box sx={{ padding: 5 }}>
        <EdfaMonitoredData
          inputPower={data?.data[EDFA_PARAMS.InputPower]}
          outputPower={data?.data[EDFA_PARAMS.OutputPower]}
          entityDescription={data?.data[EDFA_PARAMS.EntityDescription]}
          operationalState={data?.data[EDFA_PARAMS.OperationalState]}
          measuredGain={data?.data[EDFA_PARAMS.MeasuredGain]}
          edfaType={EDFA_TYPE.Preamplifier}
          monitoredData={monitoredData}
        />
        {/* <Divider />
          <VoaSettings />
          <Divider />
          <PumpSettings />
          <Divider />
          <CoilsSettings /> */}
      </Box>
    </Layout>
  );
}
export default Preamplifier;
