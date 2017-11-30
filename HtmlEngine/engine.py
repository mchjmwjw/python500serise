"""模 板 解 析 实 现 """
# -*- coding: utf-8 -*-

class CodeBuilder(object):
    """代 码 构 建 器"""
    def __init__(self, indent=0):
        self.code = []
        self.indent_level = indent

    INDENT_STEP = 4  # 设置缩进空格

    def add_line(self, line):
        """ 自动将文本缩进到当前的缩进级别，并提供一个换行符 """
        self.code.extend([" " * self.indent_level, line, "\n"])

    # 增加缩进
    def indent(self):
        self.indent_level += self.INDENT_STEP

    # 减少缩进
    def dedent(self):
        self.indent_level -= self.INDENT_STEP

    def add_section(self):
        """..."""
        section = CodeBuilder(self.indent_level)
        self.code.append(section)
        return section

    def __str__(self):
        return "".join(str(c) for c in self.code)

    # 执行字符串化对象(代码)
    def get_globals(self):
        assert self.indent_level == 0
        python_source = str(self)
        global_namespace = {}
        exec(python_source, global_namespace)
        return global_namespace        

class Templite(object):
    def __init__(self, text, *contexts): # 可变参数
        self.context = {} # dict
        for context in contexts:
            self.context.update(context)

        self.all_vars = set()
        self.loop_vars = set()

        code = CodeBuilder()
        code.add_line("def render_function(context, do_dots):")
        code.indent()
        vars_code = code.add_section()
        code.add_line("result = []")
        code.add_line("append_result = result.append")
        code.add_line("extend_result = result.extend")
        code.add_line("to_str = str")

        buffered = []
        def flush_output():
            if len(buffered) == 1:
                code.add_line("append_result(%s)" % buffered[0])
            elif len(buffered) > 1:
                code.add_line("extend_result([%s])" % ", ".join(buffered))
            del buffered[:]  # 删除buffered列表中的数据