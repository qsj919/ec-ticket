import mini_config from '../src/config/mini_config'
import independent_config from '../src/config/independent_config'
import food_independent_config from '../src/config/food_independent_config'

const APP_CONFIG = 
  process.env.INDEPENDENT === 'independent' ? { ...independent_config } : 
  process.env.INDEPENDENT === 'foodindependent' ? { ...food_independent_config } : 
  { ...mini_config }
export default APP_CONFIG
