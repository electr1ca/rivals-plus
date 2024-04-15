// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Flex, Input, Typography, Tooltip, Tag, Badge, Pagination } from 'antd';
import { purple, green, yellow, red, geekblue } from '@ant-design/colors';
import Table from './Table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
const __dbOrig = await fetch('https://mayf.pink/itl/data');
const __players = await fetch('https://mayf.pink/itl/players');
const __rpList = await fetch('https://mayf.pink/itl/rp');
const __lastUpdate = await fetch('https://mayf.pink/itl/last-update');
const dbOrig = await __dbOrig.json();
const players = await __players.json();
const rpList = await __rpList.json();
const lastUpdate = await __lastUpdate.json();
const { Text } = Typography;

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// Sort via title
const sortTitle = (a, b) => {
  const aTitle = a._title.toLowerCase();
  const bTitle = b._title.toLowerCase();
  if (aTitle < bTitle) {
    return -1;
  } else if (aTitle > bTitle) {
    return 1;
  } else {
    return 0;
  }
}

// Sort via difficulty
const sortDiff = (a, b) => {
  return Number(a._diff.match(/\d+/)[0]) - Number(b._diff.match(/\d+/)[0])
}

// Check if not 0/null/undefined
const chkNull = (val) => {
  return val !== undefined && val !== null && val !== 0
}

// Sort db properly
const db = dbOrig.filter(x => x._diff[0] === 'S')
db.sort(sortTitle);
db.sort(sortDiff);

// Check leading players
for (const i in db) {
  const song = db[i];
  const top3 = Object.keys(song).filter(key => !key.includes('_')).sort((a, b) => {
    const aScore = chkNull(song[a]) ? Number(song[a]): -1;
    const bScore = chkNull(song[b]) ? Number(song[b]): -1;
    if (aScore > bScore) {
      return -1;
    } else if (aScore < bScore) {
      return 1;
    } else {
      return 0;
    }
    }).map(player => [player, song[player]]);
  // Parse leading players
  db[i]['_top3'] = {1: [], 2: [], 3: []};
  let curScore = 101;
  let curPlace = 0;
  for (const entry of top3) {
    if (isNaN(entry[1]) || !chkNull(entry[1])) {
      break;
    } else if (entry[1] < curScore) {
      curPlace++;
      curScore = entry[1];
    } if (curPlace === 4) {
      break;
    }
    db[i]['_top3'][curPlace].push(entry[0]);
  }
}

// Sort players by RP
const sortedPlayers = Object.keys(rpList);
sortedPlayers.sort((a: string, b: string) => Number(rpList[b][0]) - Number(rpList[a][0]));

// Set columns
const columns = [
  {
    title: 'Title',
    dataIndex: '_title',
    key: 'title',
    rowScope: 'row',
    fixed: 'left',
    sorter: sortTitle,
    width: '312px',
    render: (text: string, obj) => <>
      <a href={`https://itl2024.groovestats.com/chart/${obj._id}`} target="_blank" rel="noopener">{text} {obj._noCmod ? <Tooltip title="No CMOD">🚫</Tooltip> : ''}</a> {obj._subtitle ? <Text type="secondary">{obj._subtitle}</Text> : ''}
    </>,
  },
  {
    title: 'Diff.',
    dataIndex: '_diff',
    key: 'diff',
    rowScope: 'row',
    fixed: 'left',
    width: '72px',
    sorter: sortDiff,
    render: (text: string) => {
      let bgColor;
      let txtColor;
      switch (text[1]) {
        case 'N':    bgColor = purple;    txtColor = '#fff';   break;
        case 'E':    bgColor = green;     txtColor = '#000';   break;
        case 'M':    bgColor = yellow;    txtColor = '#000';   break;
        case 'H':    bgColor = red;       txtColor = '#000';   break;
        case 'X':    bgColor = geekblue;  txtColor = '#fff';   break;
      } 
      return <span style={{backgroundColor: `${bgColor[4]}`, color: `${txtColor}`, display: 'inline-block', minWidth: '36px', textAlign: 'center', padding: '1px 4px', borderRadius: '8px'}}>{text}</span>
    },
  },
  ...sortedPlayers.map((player) => {
    // Get medal count for each player
    const medals1 = Object.keys(db).map((key: string) => db[key]["_top3"]["1"].includes(player) ? 1 : 0).reduce((a, v) => a + v, 0)
    const medals2 = Object.keys(db).map((key: string) => db[key]["_top3"]["2"].includes(player) ? 1 : 0).reduce((a, v) => a + v, 0)
    const medals3 = Object.keys(db).map((key: string) => db[key]["_top3"]["3"].includes(player) ? 1 : 0).reduce((a, v) => a + v, 0)
    // Populate player columns
    const tagStyle = (color: string) => { return {
      fontWeight: "normal",
      fontSize: "0.6em",
      color: color,
      lineHeight: "1em",
      padding: "2px",
      borderRadius: "2px",
      marginInlineEnd: "4px"
    }}
    return {
      title: <div style={{userSelect: "none"}}>
        {player}
        <Text style={{display: "block", fontWeight: "normal", fontSize: "0.75em", marginTop: "-4px"}} italic type="secondary">{rpList[player][0]} RP</Text>
        <Flex style={{marginTop: "2px"}}>
          <Tag bordered={false} color="#d5b23d" style={tagStyle("#000")}>{medals1}</Tag>
          <Tag bordered={false} color="#c0c0c0" style={tagStyle("#000")}>{medals2}</Tag>
          <Tag bordered={false} color="#8d4924" style={tagStyle("#fff")}>{medals3}</Tag>
        </Flex>
      </div>,
      dataIndex: player,
      key: player,
      sorter: (a, b, sortOrder: string) => {
        const undefSort = sortOrder === 'ascend' ? 101 : -1;
        const aScore = chkNull(a[player]) ? Number(a[player]): undefSort;
        const bScore = chkNull(b[player]) ? Number(b[player]): undefSort;
        if (aScore < bScore) {
          return -1;
        } else if (aScore > bScore) {
          return 1;
        } else {
          return 0;
        }
      },
      render: (text: string, obj) => {
        let Medal = <></>;
        if (obj["_top3"]["1"].includes(player)) {
          Medal = <Badge color="#d5b23d"/>
        } else if (obj["_top3"]["2"].includes(player)) {
          Medal = <Badge color="#c0c0c0"/>
        } else if (obj["_top3"]["3"].includes(player)) {
          Medal = <Badge color="#8d4924"/>
        }
        text = chkNull(text) ? Number(text).toFixed(2) : '';
        return <>
          <span>{text}</span> {Medal}
        </>
      },
    }
  })
]

const App = () =>  {
  const [page, setPage] = useState(1);
  const [rawSearchQuery, setRawSearchQuery] = useState("");

  // debounce search text input and use it to filter data
  const [searchQuery] = useDebounce(rawSearchQuery, 500);
  const filteredData = useMemo(() => db.filter((song) => song._title.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);

  //<Switch checkedChildren="Singles" unCheckedChildren="Doubles" defaultChecked/>
  return (
    <Flex gap="middle" align="center" vertical>
      <div className="table-wrapper">
        <Flex justify="space-between" align="center" style={{margin: "16px 0"}}>
          <Input
            onChange={(e) => setRawSearchQuery(e.target.value)}
            placeholder="Filter songs by title..."
            style={{ marginRight: "16px", maxWidth: "312px" }}
            value={rawSearchQuery}
          />
          <Pagination
            current={page}
            onChange={(ind) => setPage(ind)}
            size="small"
            showLessItems
            showSizeChanger={false}
            style={{display: 'flex'}}
            pageSize={50}
            total={db.length}
          />
        </Flex>
        <Table
          columns={columns}
          data={filteredData}
          players={players}
          lastUpdate={lastUpdate}
          page={page}
          setPage={setPage}
          query={searchQuery}
        />
      </div>
    </Flex>
  );
}

export default App;