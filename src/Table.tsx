// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Flex, Table, Typography, Tooltip, Tag } from 'antd';
import { purple, gray } from '@ant-design/colors';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { memo } from 'react';
const { Text } = Typography;

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const arePropsEqual = (prev, next) => prev.query === next.query && prev.page === next.page

const TableComponent = memo(({columns, data, players, lastUpdate, page, setPage}) =>  {
  // Time
  const dt = dayjs.unix(lastUpdate);

  // scroll width
  const scrollWidth = 87 * Object.keys(players).length + 312 + 72

  const tableTitle = () => (<>
    <Flex justify="space-between" style={{padding: "0 8px"}}>
    <Text strong>Last updated <Tooltip title={dt.format('dddd, MMMM D, YYYY h:mm A')}>
        <Tag bordered={false} color={gray[6]} style={{cursor: "default"}}>{dt.fromNow()}</Tag>
      </Tooltip></Text>
      <Text>Please tag <b style={{color: purple[3]}}>@cering</b> in the <a className="external" style={{fontWeight: 'bold'}} href="https://discord.com/channels/227650173256466432/958098084276092948" target="_blank" rel="noopener">ITG Events thread</a> to be added to the sheet or to suggest changes!</Text>
    </Flex>
  </>);

  //<Switch checkedChildren="Singles" unCheckedChildren="Doubles" defaultChecked/>
  return (
    <Table
      title={tableTitle}
      dataSource={data}
      columns={columns}
      onChange={() => {}}
      size="small"
      align="stretch"
      pagination={{
        current: page,
        onChange: (ind) => setPage(ind),
        size: "small",
        showLessItems: true,
        showSizeChanger: false,
        pageSize: 50,
        position: ['bottomRight']
      }}
      scroll={{ x: scrollWidth }}
      style={{alignSelf: "stretch"}}
      sticky
    />
  );
}, arePropsEqual)

export default TableComponent;