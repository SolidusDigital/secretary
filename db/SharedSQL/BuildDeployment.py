import os
import re

import git
import json
import datetime
import glob
from pathlib import Path


class Builder:
    def __init__(self):

        self.target_deployment_environment = None
        self.git_build_target_branch_name = None
        self.git_build_source_branch_name = None
        self.post_deployment_file_name = None
        self.manifest_output_path = None
        self.post_deployment_script_path = None
        self.build_output_path = None
        self.g = None
        self.repo = None
        self.git_remote_name = None
        self.project_root_path = None
        self.db_name = None

    def to_dict(self):
        return {
            'target_deployment_environment': self.target_deployment_environment,
            'git_build_target_branch_name': self.git_build_target_branch_name,
            'git_build_source_branch_name': self.git_build_source_branch_name,
            'post_deployment_file_name': self.post_deployment_file_name,
            'manifest_output_path': self.manifest_output_path,
            'post_deployment_script_path': self.post_deployment_script_path,
            'build_output_path': self.build_output_path,
            'git_remote_name': self.git_remote_name,
            'project_root_path': self.project_root_path

        }

    def build_pre_check(self):
        project_root_path = self._determine_project_root()
        self.project_root_path = project_root_path

        self.build_directory = Path(os.getcwd())
        build_output_path = self.build_directory / Path(r"output")
        self.manifest_output_path = self.build_directory / Path(r"manifest")
        self.post_deployment_script_path = project_root_path / Path(self.post_deployment_file_name)

        self.build_output_path = build_output_path
        self.g = git.Git(project_root_path)
        self.repo = git.repo.Repo(project_root_path)

        if not self.git_build_source_branch_name:
            self.git_build_source_branch_name = self._get_local_checked_out_branch_name()
        else:
            local_checked_out_branch_name = self._get_local_checked_out_branch_name()
            if local_checked_out_branch_name != self.git_build_source_branch_name:
                self._checkout_git_branch(self.git_build_source_branch_name)

        if not self.git_build_source_branch_name:
            raise ValueError("git_build_source_branch_name could not be determined")

        if self.git_build_source_branch_name == self.git_build_target_branch_name:
            raise ValueError("git_build_source_branch_name & git_build_target_branch are the same nothing to build")

        self.git_remote_name = self._get_git_remote_name()

        self.git_build_target_branch_name = self.git_build_target_branch_name
        self.target_deployment_environment = self.target_deployment_environment

        # self._git_refresh_branches()

        self._build_sub_dir(self.manifest_output_path)
        self._build_sub_dir(self.build_output_path)

    @staticmethod
    def _build_sub_dir(path):
        if not path.exists():
            os.mkdir(path)

    def _get_git_remote_name(self):
        remote_string = self.repo.remotes.__str__()
        start_str = remote_string.index('"')
        end_str = remote_string[::-1].index('"')
        remote_string = remote_string[start_str:-end_str].replace('"', "")

        return remote_string

    def _determine_project_root(self):
        starting_dir = Path(os.getcwd())
        git_root_folder_name = Path('.git')
        current_dir = starting_dir
        while not (current_dir / git_root_folder_name).exists():
            current_dir = current_dir.parent
            if current_dir.__str__() == starting_dir.root:
                raise ValueError(
                    f'I traversed the entire and tree and could not find a git project starting from here: {starting_dir}')

        return current_dir

    def _checkout_git_branch(self, branch_name):
        self.repo.git.stash('save')
        self.repo.git.checkout(branch_name)

    def _git_refresh_branches(self):
        git_branch_list = self.repo.references.__str__()
        case_switcher = {self.git_build_source_branch_name: 'git_build_source_branch_name',
                         self.git_build_target_branch_name: 'git_build_target_branch_name'}

        branch_name_list = [self.git_build_source_branch_name, self.git_build_target_branch_name]
        for branch_name in branch_name_list:
            if branch_name not in git_branch_list:
                raise ValueError(f'{case_switcher[branch_name]}: "{branch_name}" not in git remotes')

        for branch_name in branch_name_list:
            self.g.pull(self.git_remote_name, branch_name)

    def _get_local_checked_out_branch_name(self):
        branch = self.repo.active_branch
        build_branch = branch.name
        return build_branch

    def _get_git_changed_files(self):
        git_output_flag = '' #'--diff-filter='
        commits = []

        differ = self.g.diff(f'{self.git_build_source_branch_name}..{self.git_build_target_branch_name}', ['-R'], name_only=True).split("\n")
        # rename_only_diff = self.g.diff(f'{self.git_build_target_branch_name}..{self.git_build_source_branch_name}', ['--diff-filter=R', '-M100', ['-R']], name_only=True).split("\n")
        # for file_path in set(differ):
        #     if file_path in rename_only_diff:
        #         differ.remove(file_path)
        # dif_between_sets = set(reverse_diff) - set(differ)
        # for file_path in dif_between_sets:
        #     differ.append(file_path)

        for line in differ:
            if len(line):
                commits.append(line)
        return commits

    def _filter_files(self, file_list: list, db_build_path: Path):
        structure_file_list = []
        logic_file_list = []
        deleted_file_list = []
        post_deployment_file_list = []

        for file_path in list(file_list):
            file_path_parts = (self.project_root_path / file_path).parts
            if '_build' in file_path:
                file_list.remove(file_path)

            elif db_build_path.name not in file_path_parts or db_build_path.parent.name not in file_path_parts:
                file_list.remove(file_path)

            elif Path(file_path).suffix not in ('.sql'):
                file_list.remove(file_path)

            elif '.gitignore' in file_path:
                file_list.remove(file_path)

            elif 'post_deployment' in file_path:
                post_deployment_file_list.append(file_path)

            elif '_tests' in file_path:
                file_list.remove(file_path)

            elif not Path(self.project_root_path / file_path).exists():
                deleted_file_list.append(file_path)

            elif '_structure' in file_path:
                structure_file_list.append(file_path)
            else:
                logic_file_list.append(file_path)

        structure_file_list = sorted(structure_file_list)
        return structure_file_list, logic_file_list, deleted_file_list, post_deployment_file_list

    @staticmethod
    def _repeat_to_length(string_to_expand, length):
        return (string_to_expand * (int(length / len(string_to_expand)) + 1))[:length]

    def _build_output_files(self, file_inout_dict: dict, db_name: str):
        for key, value in file_inout_dict.items():
            out_dir = self.build_output_path / db_name
            self._build_sub_dir(out_dir)

            out_path = out_dir / key
            self._write_output_file(value, out_path)

    def _write_output_file(self, input_file_list: list, output_file_path: str):
        hard_wrap_guide = 120
        script_terminator = f"{self._repeat_to_length('-', hard_wrap_guide)} \n"
        script_terminator = script_terminator * 3

        with open(output_file_path, 'w') as outfile:
            outfile.write('BEGIN TRANSACTION;\nGO;\n')
            for file_name in input_file_list:
                start_script_separator = f"\n-- BEGIN SCRIPT {file_name}\n"
                end_script_separator = f"\n-- END SCRIPT {file_name}\n{script_terminator}\nGO;"
                with open(self.project_root_path / file_name, 'r') as infile:
                    infile_string = self._alter_script_per_environment(script=infile)
                    outfile.write(start_script_separator + infile_string + end_script_separator)
            outfile.write('COMMIT TRANSACTION;')

    def _clean_manifest_dir(self):
        files = glob.glob(str(self.manifest_output_path / '*.json'))
        for file_name in files:
            try:
                os.remove(file_name)
            except OSError as e:
                print("Error: %s : %s" % (file_name, e.strerror))

    def _write_manifest(self, manifest_dict: dict):
        current_datetime = datetime.datetime.now()
        current_datetime = int(current_datetime.strftime('%Y%m%d%H%M'))

        build_branch_name = self.git_build_source_branch_name.replace('/', '_')
        build_branch_name = f'{current_datetime}_{build_branch_name}'

        manifest_file_name = self.manifest_output_path / f'{self.db_name}_{build_branch_name}.json'
        file_content = json.dumps(manifest_dict, indent=1)

        with open(manifest_file_name, 'w') as convert_file:
            convert_file.write(file_content)

    def _alter_script_per_environment(self, script):
        new_script = ''
        if self.target_deployment_environment == 'DEV':
            pass
            # replacement_string = '-- \\1'
            # new_script = self._regex_replace_in_file(file=script, search_pattern=search_pattern,
            #                                          replacement_string=replacement_string)

        elif self.target_deployment_environment == 'PROD':
            new_script = script.read()
        else:
            raise ValueError(f'unknown target_deployment_environment: "{self.target_deployment_environment}"')

        return new_script

    @staticmethod
    def _regex_replace_in_file(file, search_pattern, replacement_string):
        new_file_string = ''
        for line in file:
            new_line = re.sub(pattern=search_pattern, repl=replacement_string, string=line)
            if new_line != line:
                line = line.replace(line, new_line)
                print({'replaced': line})
            new_file_string = new_file_string + line

        return new_file_string

    def _determine_database(self, change_list):
        db_name_list = []
        db_name_that_exists = []
        for file_path in change_list:
            file_path = Path(file_path)
            keyword_list = ['Logic', '_structure']
            for keyword in keyword_list:
                if keyword in file_path.parts:
                    keyword_index = file_path.parts.index(keyword) - 1 # get_parent_of_keyword
                    db_name_list.append(file_path.parts[keyword_index])
        db_name_list = list(set(db_name_list))

        for db_name in db_name_list:
            if (self.build_directory / db_name).exists():
                db_name_that_exists.append(db_name)

        return db_name_that_exists

    def _build_deployment(self):
        change_list = self._get_git_changed_files()
        db_name_list = self._determine_database(change_list)
        self._clean_manifest_dir()
        for db_name in db_name_list:
            self.db_name = db_name
            change_list2 = change_list.copy()
            db_build_path = (self.build_directory / db_name)
            structure_file_list, logic_file_list, deleted_file_list, post_deployment_file_list = self._filter_files(change_list2, db_build_path)

            manifest_dict = {
                "01_structure.sql": structure_file_list,
                "02_logic.sql": logic_file_list,
                "03_post_deployment.sql": post_deployment_file_list,
                "deleted_file_list": deleted_file_list,
            }
            self._write_manifest(manifest_dict)
            manifest_dict.pop("deleted_file_list")
            self._build_output_files(file_inout_dict=manifest_dict, db_name=db_name)

    def _get_build_files(self):
        build_dict = {}
        files = glob.glob(str(self.build_output_path / '*.sql'))
        files.sort()
        for file in files:
            with open(file, 'r') as infile:
                file_name = Path(file).name
                build_dict[file_name] = infile.read()
        return build_dict

    def build_deployment(self, target_deployment_environment, git_build_target_branch_name,
                         git_build_source_branch_name=None, post_deployment_file_name=None):
        build_dict = None
        error_code = None
        error_message = ''

        self.target_deployment_environment = target_deployment_environment.upper()
        self.git_build_target_branch_name = git_build_target_branch_name
        self.git_build_source_branch_name = git_build_source_branch_name
        self.post_deployment_file_name = post_deployment_file_name
        try:
            self.build_pre_check()
            self._build_deployment()
            build_dict = self._get_build_files()
        except Exception as e:
            error_code = 1
            error_message = e.__str__()
        return error_code, error_message, build_dict


if __name__ == '__main__':
    print('---------------------------------------------------------')
    print('Start scripts deployment')
    print('---------------------------------------------------------')
    error_code, result, build_files = Builder().build_deployment(
        target_deployment_environment='prod',
        git_build_target_branch_name='main',
        git_build_source_branch_name=None, #this is optional if not specified, it defaults to the current branch that is checked out locally.
        post_deployment_file_name='post_deployment.sql')

    print({'error_code': error_code, 'result': result})
    print('---------------------------------------------------------')
    print('FINISH')
    print('---------------------------------------------------------')
