import type { ClassicQuoteCard } from '../schema';
import { CHUCI_SOURCE, SHIJING_SOURCE, TANG_POETRY_SOURCE, SONG_CI_SOURCE } from '../sources';
import { SHIJING_QUOTES } from './shijing';
import { CHUCI_QUOTES } from './chuci';

const TANG_QUOTES: ClassicQuoteCard[] = [
  {
    id: 'tang-qingquan',
    quote: '明月松间照，清泉石上流',
    source: { ...TANG_POETRY_SOURCE, title: '王维《山居秋暝》', author: '王维' },
    usableChars: ['清', '泉', '松'],
    styleTags: ['清雅', '自然', '诗意'],
    note: '清字可承接山水澄明的意境。',
  },
  {
    id: 'tang-yunfan',
    quote: '直挂云帆济沧海',
    source: { ...TANG_POETRY_SOURCE, title: '李白《行路难》', author: '李白' },
    usableChars: ['云', '帆', '济'],
    styleTags: ['大气', '明朗'],
    note: '适合开阔、大气方向，但本 MVP 仅作少量样例。',
  },
  {
    id: 'tang-shuying',
    quote: '疏影横斜水清浅',
    source: { ...TANG_POETRY_SOURCE, title: '林逋《山园小梅》', author: '林逋' },
    usableChars: ['疏', '影', '清'],
    styleTags: ['清雅', '诗意'],
    note: '清字可用于清浅、疏朗的审美表达。',
  },
];

const SONG_QUOTES: ClassicQuoteCard[] = [
  {
    id: 'song-yue',
    quote: '一蓑烟雨任平生',
    source: { ...SONG_CI_SOURCE, title: '苏轼《定风波》', author: '苏轼' },
    usableChars: ['雨', '平', '生'],
    styleTags: ['豁达', '大气'],
    note: '偏豁达气质，注意避免过度阐释。',
  },
  {
    id: 'song-yunshu',
    quote: '云破月来花弄影',
    source: { ...SONG_CI_SOURCE, title: '张先《天仙子》', author: '张先' },
    usableChars: ['云', '月', '影'],
    styleTags: ['诗意', '清雅'],
    note: '适合诗意、柔和的名字意象。',
  },
];

const ADDITIONAL_CLASSIC_QUOTES: ClassicQuoteCard[] = [
  { id: 'shijing-jianjia', quote: '蒹葭苍苍，白露为霜', source: { ...SHIJING_SOURCE, title: '《诗经·秦风·蒹葭》', chapter: '秦风' }, usableChars: ['葭', '苍', '露'], styleTags: ['清雅', '诗意', '自然'], note: '适合清冷、自然意象，MVP 样例仅作出处约束。' },
  { id: 'shijing-taoyao', quote: '桃之夭夭，灼灼其华', source: { ...SHIJING_SOURCE, title: '《诗经·周南·桃夭》', chapter: '周南' }, usableChars: ['桃', '华', '灼'], styleTags: ['明朗', '诗意'], note: '偏明丽意象，需避免过度艳丽表达。' },
  { id: 'shijing-zhenzhen', quote: '振鹭于飞，于彼西雍', source: { ...SHIJING_SOURCE, title: '《诗经·周颂·振鹭》', chapter: '周颂' }, usableChars: ['振', '鹭', '雍'], styleTags: ['大气', '典雅'], note: '振字有舒展、振起之意。' },
  { id: 'shijing-yanyan', quote: '燕燕于飞，差池其羽', source: { ...SHIJING_SOURCE, title: '《诗经·邶风·燕燕》', chapter: '邶风' }, usableChars: ['燕', '羽'], styleTags: ['诗意', '灵动'], note: '可用于轻盈灵动的意象。' },
  { id: 'shijing-mingming', quote: '明明上天，照临下土', source: { ...SHIJING_SOURCE, title: '《诗经·小雅·小明》', chapter: '小雅' }, usableChars: ['明', '照'], styleTags: ['明朗', '大气'], note: '明、照可表达清明光亮。' },
  { id: 'shijing-youmei', quote: '有美一人，婉如清扬', source: { ...SHIJING_SOURCE, title: '《诗经·郑风·野有蔓草》', chapter: '郑风' }, usableChars: ['婉', '清', '扬'], styleTags: ['清雅', '温润'], note: '与清扬出处同源，补充可用字。' },
  { id: 'shijing-heling', quote: '鹤鸣于九皋，声闻于天', source: { ...SHIJING_SOURCE, title: '《诗经·小雅·鹤鸣》', chapter: '小雅' }, usableChars: ['鹤', '鸣', '闻'], styleTags: ['大气', '清雅'], note: '鸣字可取声名清越之意，但保持文化参考。' },
  { id: 'shijing-ruxing', quote: '嘒彼小星，三五在东', source: { ...SHIJING_SOURCE, title: '《诗经·召南·小星》', chapter: '召南' }, usableChars: ['星', '东'], styleTags: ['明朗', '诗意'], note: '星字偏明朗意象。' },

  { id: 'chuci-lan', quote: '余既滋兰之九畹兮', source: { ...CHUCI_SOURCE, title: '《楚辞·离骚》', chapter: '离骚' }, usableChars: ['兰', '滋'], styleTags: ['典雅', '清雅'], note: '兰意象清芬，适合文雅方向。' },
  { id: 'chuci-muying', quote: '浴兰汤兮沐芳', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·云中君》', chapter: '九歌' }, usableChars: ['兰', '沐', '芳'], styleTags: ['清雅', '诗意'], note: '沐、芳可用于清洁芬芳意象。' },
  { id: 'chuci-yunzhong', quote: '灵连蜷兮既留', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·云中君》', chapter: '九歌' }, usableChars: ['灵', '留'], styleTags: ['灵动', '诗意'], note: '灵字需避免神秘化承诺，仅作文化意象。' },
  { id: 'chuci-junxin', quote: '君欣欣兮乐康', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·东皇太一》', chapter: '九歌' }, usableChars: ['欣', '乐', '康'], styleTags: ['明朗', '温润'], note: '欣、康偏积极安和。' },
  { id: 'chuci-yuyang', quote: '望涔阳兮极浦', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·湘君》', chapter: '九歌' }, usableChars: ['阳', '浦'], styleTags: ['自然', '大气'], note: '阳字偏明朗，浦字偏水岸意象。' },
  { id: 'chuci-fangzhou', quote: '采芳洲兮杜若', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·湘君》', chapter: '九歌' }, usableChars: ['芳', '洲', '若'], styleTags: ['清雅', '诗意'], note: '若字可接香草意象。' },
  { id: 'chuci-yuanyou', quote: '悲莫悲兮生别离', source: { ...CHUCI_SOURCE, title: '《楚辞·九歌·少司命》', chapter: '九歌' }, usableChars: ['离'], styleTags: ['典雅'], note: '此卡仅作风险样例，实际起名需谨慎。' },
  { id: 'chuci-huaiyu', quote: '怀瑾握瑜兮', source: { ...CHUCI_SOURCE, title: '《楚辞·九章·怀沙》', chapter: '九章' }, usableChars: ['瑾', '瑜'], styleTags: ['典雅', '沉稳'], note: '瑾、瑜为美玉意象，注意热名风险。' },

  { id: 'tang-chunxiao', quote: '春眠不觉晓', source: { ...TANG_POETRY_SOURCE, title: '孟浩然《春晓》', author: '孟浩然' }, usableChars: ['春', '晓'], styleTags: ['明朗', '自然'], note: '晓字偏晨光初明。' },
  { id: 'tang-luming', quote: '海上生明月', source: { ...TANG_POETRY_SOURCE, title: '张九龄《望月怀远》', author: '张九龄' }, usableChars: ['海', '明', '月'], styleTags: ['大气', '明朗'], note: '明、月为开阔清亮意象。' },
  { id: 'tang-youlan', quote: '兰叶春葳蕤', source: { ...TANG_POETRY_SOURCE, title: '张九龄《感遇》', author: '张九龄' }, usableChars: ['兰', '蕤'], styleTags: ['清雅', '自然'], note: '兰字承清雅植物意象。' },
  { id: 'tang-yuanshang', quote: '离离原上草', source: { ...TANG_POETRY_SOURCE, title: '白居易《赋得古原草送别》', author: '白居易' }, usableChars: ['原', '草'], styleTags: ['自然', '大气'], note: '原字有开阔之意。' },
  { id: 'tang-qinghui', quote: '清辉玉臂寒', source: { ...TANG_POETRY_SOURCE, title: '杜甫《月夜》', author: '杜甫' }, usableChars: ['清', '辉'], styleTags: ['清雅', '典雅'], note: '清、辉可组合清亮意象。' },
  { id: 'tang-jiangxue', quote: '独钓寒江雪', source: { ...TANG_POETRY_SOURCE, title: '柳宗元《江雪》', author: '柳宗元' }, usableChars: ['江', '雪'], styleTags: ['清雅', '自然'], note: '雪字清洁，但整体意象偏冷。' },
  { id: 'tang-songyue', quote: '松月生夜凉', source: { ...TANG_POETRY_SOURCE, title: '孟浩然《宿业师山房期丁大不至》', author: '孟浩然' }, usableChars: ['松', '月'], styleTags: ['自然', '清雅'], note: '松、月偏清朗沉静。' },
  { id: 'tang-xingye', quote: '星垂平野阔', source: { ...TANG_POETRY_SOURCE, title: '杜甫《旅夜书怀》', author: '杜甫' }, usableChars: ['星', '野', '阔'], styleTags: ['大气', '明朗'], note: '星、阔可承接开阔意象。' },

  { id: 'song-qingzhao', quote: '清露晨流，新桐初引', source: { ...SONG_CI_SOURCE, title: '李清照《念奴娇》', author: '李清照' }, usableChars: ['清', '露', '桐', '初'], styleTags: ['清雅', '自然'], note: '清、桐、初均为常用起名意象。' },
  { id: 'song-jinse', quote: '云中谁寄锦书来', source: { ...SONG_CI_SOURCE, title: '李清照《一剪梅》', author: '李清照' }, usableChars: ['云', '锦', '书'], styleTags: ['书卷', '诗意'], note: '锦书为书信意象。' },
  { id: 'song-ruyi', quote: '归去，也无风雨也无晴', source: { ...SONG_CI_SOURCE, title: '苏轼《定风波》', author: '苏轼' }, usableChars: ['归', '雨', '晴'], styleTags: ['豁达', '明朗'], note: '晴字可用，整体仅作出处样例。' },
  { id: 'song-mingyue', quote: '明月几时有', source: { ...SONG_CI_SOURCE, title: '苏轼《水调歌头》', author: '苏轼' }, usableChars: ['明', '月'], styleTags: ['明朗', '大气'], note: '明、月为开阔清亮意象。' },
  { id: 'song-xiaoxiao', quote: '小楼一夜听春雨', source: { ...SONG_CI_SOURCE, title: '陆游《临安春雨初霁》', author: '陆游' }, usableChars: ['春', '雨', '霁'], styleTags: ['清雅', '自然'], note: '霁字可表达雨后晴明。' },
  { id: 'song-heye', quote: '叶上初阳干宿雨', source: { ...SONG_CI_SOURCE, title: '周邦彦《苏幕遮》', author: '周邦彦' }, usableChars: ['叶', '初', '阳', '雨'], styleTags: ['自然', '明朗'], note: '初、阳可表达清新明朗。' },
  { id: 'song-qingyuan', quote: '一川烟草，满城风絮', source: { ...SONG_CI_SOURCE, title: '贺铸《青玉案》', author: '贺铸' }, usableChars: ['川', '风'], styleTags: ['诗意', '自然'], note: '风、川可作自然意象。' },
  { id: 'song-lingbo', quote: '凌波不过横塘路', source: { ...SONG_CI_SOURCE, title: '贺铸《青玉案》', author: '贺铸' }, usableChars: ['凌', '波', '塘'], styleTags: ['清雅', '诗意'], note: '凌、波偏水意象，注意读音搭配。' },
];

export const CLASSIC_QUOTES: ClassicQuoteCard[] = [
  ...SHIJING_QUOTES,
  ...CHUCI_QUOTES,
  ...TANG_QUOTES,
  ...SONG_QUOTES,
  ...ADDITIONAL_CLASSIC_QUOTES,
];
