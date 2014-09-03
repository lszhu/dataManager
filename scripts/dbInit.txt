// 数据库维护备忘
// example for administrator
use admin

show users

db.createUser(
	{
		user: 'admin',
		pwd: 'letmein',
		roles: ['root']
	}
);

// example for each county

use ningyuan

show users

db.createUser(
	{
		user: 'hrsys',
		pwd: 'letmein',
		roles: ['readWrite']
	}
);

db.hrmsgs.ensureIndex({idNumber: 1}, {unique: true});

db.hrmsgs.ensureIndex({districtId: 1});