var debug = require('debug')('project');
var tool = require('./tool');

function parseProject(req) {
    //var project = {};
    var id = req.body.id;
    // use UTC seconds to create ID if no id was supplied
    id = id ? id.trim() : Date.now().toString(36).toUpperCase();
    var name =  req.body.name;
    name = name ? name.trim() : '';
    var newName =  req.body.newName;
    newName = newName ? newName.trim() : '';
    var description = req.body.description ? req.body.description : '';
    description = description.trim();
    var parent = req.body.parent ? req.body.parent : '';
    parent = parent.trim();
    debug('parent: ' + parent);
    var children = req.body.children ? req.body.children : [];
    debug('children: ' + JSON.stringify(children));
    return {
        id: id,
        name: name,
        newName: newName,
        description: description,
        parent: parent,
        children: children
        //contract: contract,
        //file: file
    };
}

function recursiveSubProject(docs, project) {
    if (project.name == project.parent) {
        return true;
    }
    if (project.children
        && project.children.some(function(e) {return e == project;})) {
        return true;
    }
    var len = docs.length;
    for (var i = 0, p = project.parent; i < len && p != ''; i++) {
        if (project.children.some(function(e) {return e == p;})) {
            debug('recursion occurred.');
            return true;
        }
        p = parentProjectName(docs, p);
        //debug('parent project: ' + p);
    }
    return false;
}

function parentProjectName(docs, projectName) {
    for (var i = 0, len = docs.length; i < len; i++) {
        if (docs[i].name == projectName) {
            return docs[i].parent ? docs[i].parent : '';
        }
    }
    return '';
}

//function renameProject(db, docs, project, res, logMsg) {
//
//}

// filter out projects should be update passively
function relatedProject(docs, project) {
    // filter out parent project
    var parentData;
    if (project.parent) {
        parentData = docs
            .filter(function(e) {return e.name == project.parent;})[0];
    }
    // old children project, but isn't now
    var oldChildrenData = [];
    var oldProject = docs
        .filter(function(e) {return e.name == project.name;})[0];
    oldProject = oldProject ? oldProject : {};
    debug('oldProject: ' + JSON.stringify(oldProject));

    if (oldProject.children) {
        oldChildrenData = docs.filter(function(e) {
            return project.children.every(function(c) {return c != e.name;}) &&
                oldProject.children.some(function(c) {return c == e.name;});
        });
    }
    // the target project's old parent but not current parent
    var oldOwnParentData = {};
    if (oldProject.parent && oldProject.parent != project.parent) {
        oldOwnParentData = docs
            .filter(function(e) {return e.name == oldProject.parent;})[0];
    }
    debug('oldOwnParentData: ' + JSON.stringify(oldOwnParentData));
    // filter out children project
    var childrenData = docs.filter(function(e) {
        return project.children && project.children
            .some(function(el) {return el == e.name;});
    });
    debug('childrenData: ' + JSON.stringify(childrenData));
    // old parent project
    var oldParentData = docs.filter(function(e) {
        // exclude the project being updated
        // include target project's old parent
        // include target project's children's old father
        return e.name != project.name &&
            childrenData.some(function(el) {return el.parent == e.name;});
    });

    var projects = {};
    // update parentData to conform change
    if (parentData && parentData.name) {
        if (!parentData.children) {
            parentData.children = [project.name];
        } else if (parentData.children.every(function(e) {
            return e != project.name
        })) {
            parentData.children.push(project.name);
        }
    }
    // update target project's own old parent
    if (oldOwnParentData && oldOwnParentData.children) {
        oldOwnParentData.children = oldOwnParentData.children
            .filter(function(e) {return e != project.name;});
        projects.oldOwnParentData = oldOwnParentData;
        //{
        //    name: oldOwnParentData.name,
        //    children: oldOwnParentData.children
        //};
    }

    var i;
    // update oldParentData to conform change
    for (i = 0; i < oldParentData.length; i++) {
        if (!oldParentData[i].children
            || oldParentData[i].children.length == 0) {
            continue;
        }
        oldParentData[i].children = oldParentData[i].children
            .filter(function(e) {
                return project.children.every(function(el) {return el != e;});
            });
    }
    // update childrenData to conform change
    for (i = 0; i < childrenData.length; i++) {
        childrenData[i].parent = project.name;
    }
    // update oldChildrenData to conform change
    for (i = 0; i < oldChildrenData.length; i++) {
        oldChildrenData[i].parent = '';
    }

    projects.parentData = parentData;
    projects.oldParentData = oldParentData;
    projects.childrenData = childrenData;
    projects.oldChildrenData = oldChildrenData;

    return projects;
}

// update project but Not change project name
function updateProject(db, docs, project, res, logMsg) {
    var data = relatedProject(docs, project);
    debug('related project: ' + JSON.stringify(data));
    debug('project: ' + JSON.stringify(project));

    if (project.newName && project.newName != project.name) {
        // can not change project name to a exist name
        var duplicate = docs
            .filter(function(e) {return e.name == project.newName;});
        if (duplicate.length) {
            res.send({status: 'duplicateName',
                message: '系统中已存在名称为' + project.newName + '的项目'});
            tool.log(db, logMsg, '项目改名失败');
            console.log('无法将项目改名为已存在的项目名称');
            return;
        }

        // update related parent and children project
        var i;
        for (i = 0; i < data.childrenData.length; i++) {
            data.childrenData[i].parent = project.newName;
        }
        if (data.parentData && data.parentData.children) {
            for (i = 0; i < data.parentData.children.length; i++) {
                if (data.parentData.children[i] == project.name) {
                    data.parentData.children[i] = project.newName;
                }
            }
        }
        // store the original name
        project.oldName = project.name;
        // change project name to new name
        project.name = project.newName;
    } else {
        project.oldName = project.name;
    }

    var counter = {};
    // to count running saving procedures
    counter.count = 1;
    db.save('project', {name: project.oldName},
        project, saveCallback(db, counter, res, logMsg));
    // update financial figures
    if (project.oldName && project.oldName != project.name) {
        counter.count++;
        db.save('figure', {project: project.oldName},
            {project: project.name}, saveCallback(db, counter, res, logMsg));
    }
    if (data.parentData && data.parentData.name) {
        counter.count++;
        db.save('project', {name: data.parentData.name},
            data.parentData, saveCallback(db, counter, res, logMsg));
    }
    if (data.oldOwnParentData) {
        counter.count++;
        db.save('project', {name: data.oldOwnParentData.name},
            data.oldOwnParentData, saveCallback(db, counter, res, logMsg));
    }
    for (i = 0; i < data.oldParentData.length; i++) {
        counter.count++;
        db.save('project', {name: data.oldParentData[i].name},
            data.oldParentData[i], saveCallback(db, counter, res, logMsg));
    }
    for (i = 0; i < data.childrenData.length; i++) {
        counter.count++;
        db.save('project', {name: data.childrenData[i].name},
            data.childrenData[i], saveCallback(db, counter, res, logMsg));
    }
    for (i = 0; i < data.oldChildrenData.length; i++) {
        counter.count++;
        db.save('project', {name: data.oldChildrenData[i].name},
            data.oldChildrenData[i], saveCallback(db, counter, res, logMsg));
    }
}

function saveCallback(db, counter, res, logMsg) {
    return function(err) {
        counter.count--;
        // collect saving errors
        var errors = [];
        if (err) {
            errors.push(err);
            console.log('Db error: ' + JSON.stringify(err));
        }
        if (counter.count == 0) {
            if (errors.length > 0) {
                res.send({status: 'dbErr',
                    message: '项目数据保存失败'});
                tool.log(db, logMsg, '数据保存失败');
                console.log('project saving error: %o', errors);
            } else {
                res.send({status: 'ok', message: '创建项目成功'});
                tool.log(db, logMsg, '创建项目成功', '成功');
            }
        }
    };
}

function deleteProject(db, doc, res, logMsg) {
    // a counter to record concurrent db operations
    var counter = {count: 0};
    // error container
    var error = [];
    if (doc.parent) {
        counter.count++;
        db.queryOne('project', {name: doc.parent}, function(err, parent) {
            if (err) {
                error.push(err);
                tool.log(db, logMsg);
                projectDeleteReply(db, counter, error, res, logMsg);
                return;
            }
            debug('parent project: ' + JSON.stringify(parent));
            if (!parent || !parent.children || !parent.children.length) {
                console.log('project information not consistence');
                error.push({status: 'dbErr', message: '数据库信息存在不一致'});
                tool.log(db, logMsg);
                projectDeleteReply(db, counter, error, res, logMsg);
                return;
            }
            parent.children = parent.children
                .filter(function(e) {return e != doc.name});
            debug('parent children: ' + parent.children);
            db.save('project', {name: parent.name}, parent,
                projectDeleteReply(db, counter, error, res, logMsg));
        });
    }
    counter.count++;
    db.remove('project', {name: doc.name},
        projectDeleteReply(db, counter, error, res, logMsg));
    counter.count++;
    db.remove('figure', {project: doc.name},
        projectDeleteReply(db, counter, error, res, logMsg));
}

function projectDeleteReply(db, counter, error, res, logMsg) {
    return function(err) {
        counter.count--;
        debug('counter.count: ' + counter.count);
        if (err) {
            error.push(err);
            console.log('db error: %o', err);
        }
        if (counter.count) {
            return
        }
        if (error.length) {
            res.send({status: 'dbErr',
                message: '数据库操作失败', error: error});
            tool.log(db, logMsg);
            return;
        }
        res.send({status: 'ok', message: '删除项目成功'});
        tool.log(db, logMsg, '删除项目成功', '成功');
    }
}

// collect sub projects or descendent projects of a project, include itself
function getRelatives(name, projects) {
    debug('projects.length: ' + projects.length);
    if (!name) {
        return [];
    }
    var names = [name];
    for (var i = 0; names.hasOwnProperty(i); i++) {
        names = names.concat(getChildProjects(names[i], projects));
        //debug('in getRelatives function');
    }
    return names;
}

function getChildProjects(name, projects) {
    var projectNames = [];
    for (var i = 0; projects && i < projects.length; i++) {
        if (projects[i].parent == name) {
            projectNames.push(projects[i].name);
            //debug('projectNames: ' + JSON.stringify(projectNames));
        }
    }
    return projectNames;
}

module.exports = {
    parseProject: parseProject,
    recursiveSubProject: recursiveSubProject,
    //renameProject: renameProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    getRelatives: getRelatives
};