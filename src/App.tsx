// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Flex, Table, Typography, Tooltip, Tag, Badge } from 'antd';
import { purple, green, yellow, red, geekblue, gray } from '@ant-design/colors';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
const __dbOrig = await fetch('https://mayf.pink/itl/data');
const __players = await fetch('https://mayf.pink/itl/players');
const __rpList = await fetch('https://mayf.pink/itl/rp');
const dbOrig = await __dbOrig.json();
const players = await __players.json();
const rpList = await __rpList.json();
const { Text } = Typography;

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

const App = () =>  {

  const db = dbOrig.filter(x => x._diff[0] === 'S')

  // Sort db properly
  db.sort(sortTitle);
  db.sort(sortDiff);

  // Medal count calculations

  // Check leading players
  for (const i in db) {
    const song = db[i];
    const top3 = Object.keys(song).filter(key => !key.includes('_')).sort((a, b) => {
      const aScore = song[a] !== undefined ? Number(song[a]): -1;
      const bScore = song[b] !== undefined ? Number(song[b]): -1;
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
      if (isNaN(entry[1])) {
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
  ]

  // Sort players by RP
  const sortedPlayers = Object.keys(rpList);
  sortedPlayers.sort((a: string, b: string) => Number(rpList[b][0]) - Number(rpList[a][0]));

  sortedPlayers.forEach(player => {
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
    columns.push({
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
        const aScore = a[player] !== undefined ? Number(a[player]): undefSort;
        const bScore = b[player] !== undefined ? Number(b[player]): undefSort;
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
        return <>
          <span>{text}</span> {Medal}
        </>
      },
    })
  })

  // Time
  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);
  dayjs.extend(timezone);
  dayjs.tz.setDefault('America/New_York');
  const dt = dayjs("2024-03-26 12:48", "YYYY-MM-DD hh:mm");

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
    <Flex gap="middle" align="center" vertical>
      <div className="table-wrapper">
        <Table
          title={tableTitle}
          dataSource={db}
          columns={columns}
          onChange={() => {}}
          size="small"
          align="stretch"
          pagination={{
            size: "small",
            showLessItems: true,
            showSizeChanger: false,
            pageSize: 75,
            position: ['topRight', 'bottomRight']
          }}
          scroll={{ x: scrollWidth }}
          style={{alignSelf: "stretch"}}
        />
      </div>
    </Flex>
  );
}

export default App;