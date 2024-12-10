export const SUI_MIST = 1000000000
export const Draft = 0
export const Published = 1
export const Completed = 2
export const STATUS_MAP = {
  [Draft]: '草稿',
  [Published]: '已发布',
  [Completed]: '完成'
}
export const REWARD_METHODS = {
    1: '通过审核就发放单个申请奖励',
    2: '从通过审核者中抽取1位幸运儿独得奖池的奖励'
}
export const Approving  = 0
export const Pass = 1
export const Fail = 2
export const RESULT_MAP = {
  [Approving]: '审核中',
  [Pass]: '通过',
  [Fail]: '不通过'
}
